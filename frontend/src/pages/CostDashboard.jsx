import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const CostDashboard = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [costForm,      setCostForm]      = useState({ title: '', amount: '', splitType: 'EVEN' });
  const [activeCostId,  setActiveCostId]  = useState(null);
  const [previewData,   setPreviewData]   = useState(null);
  const [isProcessing,  setIsProcessing]  = useState(false);
  const [dynamicInputs, setDynamicInputs] = useState({});

  const totalAmount = Number(costForm.amount) || 0;

  // ── Real-time calculations ──────────────────────────────────────
  const customTotal = previewData
    ? previewData.allocations.reduce((sum, a) => sum + (Number(dynamicInputs[a.tenantId]) || 0), 0)
    : 0;
  const customRemaining   = 100 - customTotal;          // % left to assign
  const customRsRemaining = previewData
    ? totalAmount - previewData.allocations.reduce((sum, a) => {
        const pct = Number(dynamicInputs[a.tenantId]) || 0;
        return sum + Number(((pct / 100) * (previewData.totalAmount || 0)).toFixed(2));
      }, 0)
    : 0;

  const manualTotal     = previewData
    ? previewData.allocations.reduce((sum, a) => sum + (Number(dynamicInputs[a.tenantId]) || 0), 0)
    : 0;
  const manualRemaining = (previewData?.totalAmount || 0) - manualTotal;

  const handleCalculateSplit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const costRes = await axiosInstance.post('/costs', {
        boardingPlaceId: id,
        title: costForm.title,
        amount: Number(costForm.amount),
        splitType: costForm.splitType,
      });
      setActiveCostId(costRes.data._id);

      const previewRes = await axiosInstance.get(`/costs/${costRes.data._id}/allocations`);
      setPreviewData(previewRes.data);

      const initial = {};
      previewRes.data.allocations.forEach(a => { initial[a.tenantId] = ''; });
      setDynamicInputs(initial);
      toast.success('Ready for review!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to calculate split');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateCharges = async () => {
    let finalAllocations = [];

    if (previewData.splitType === 'EVEN') {
      finalAllocations = previewData.allocations.map(a => ({ tenantId: a.tenantId, amount: a.allocatedAmount }));

    } else if (previewData.splitType === 'CUSTOM') {
      let totalPct = 0;
      finalAllocations = previewData.allocations.map(a => {
        const pct = Number(dynamicInputs[a.tenantId]) || 0;
        totalPct += pct;
        return { tenantId: a.tenantId, amount: Number(((pct / 100) * previewData.totalAmount).toFixed(2)) };
      });
      if (Math.abs(totalPct - 100) > 0.01) return toast.error(`Percentages must add up to 100%. Currently: ${totalPct.toFixed(1)}%`);

    } else if (previewData.splitType === 'MANUAL') {
      let totalManual = 0;
      finalAllocations = previewData.allocations.map(a => {
        const amt = Number(dynamicInputs[a.tenantId]) || 0;
        totalManual += amt;
        return { tenantId: a.tenantId, amount: amt };
      });
      if (Math.abs(totalManual - previewData.totalAmount) > 0.01) {
        return toast.error(`Amounts must add up to Rs.${previewData.totalAmount}. Currently: Rs.${totalManual}`);
      }
    }

    setIsProcessing(true);
    try {
      await axiosInstance.post(`/costs/${activeCostId}/charges`, { allocations: finalAllocations });
      toast.success('Bills generated successfully!');
      navigate(`/owner/property/${id}`);
    } catch {
      toast.error('Failed to generate charges');
    } finally {
      setIsProcessing(false);
    }
  };

  const splitOptions = [
    { val: 'EVEN',   label: t('even'),   hint: 'Cost divided equally among all tenants' },
    { val: 'CUSTOM', label: t('custom'), hint: 'You set the percentage for each tenant' },
    { val: 'MANUAL', label: t('manual'), hint: 'You enter the exact Rs. amount for each' },
  ];

  // Progress bar colour
  const customBarColor =
    Math.abs(customTotal - 100) < 0.01 ? 'var(--success)' :
    customTotal > 100 ? 'var(--danger)' : 'var(--primary)';

  const manualBarColor =
    previewData && Math.abs(manualTotal - previewData.totalAmount) < 0.01 ? 'var(--success)' :
    previewData && manualTotal > previewData.totalAmount ? 'var(--danger)' : 'var(--primary)';

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>
      <div className="page-header">
        <h1 className="page-title">{t('generateBills')}</h1>
        <p className="page-sub">Create a shared bill and distribute it among tenants</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Step 1 */}
        <div className="card" style={{ flex: 1, minWidth: 280 }}>
          <h3 className="section-title">1. {t('newBill')}</h3>
          <form onSubmit={handleCalculateSplit}>
            <div className="form-group">
              <label className="form-label">Bill Title</label>
              <input type="text" className="form-input" placeholder="e.g., Electricity - September"
                value={costForm.title} onChange={e => setCostForm({ ...costForm, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (Rs.)</label>
              <input type="number" className="form-input" min="1"
                value={costForm.amount} onChange={e => setCostForm({ ...costForm, amount: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">{t('splitMethod')}</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {splitOptions.map(opt => (
                  <label key={opt.val} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                    padding: '0.75rem', borderRadius: '0.6rem', cursor: 'pointer',
                    border: `2px solid ${costForm.splitType === opt.val ? 'var(--primary)' : 'var(--border-color)'}`,
                    background: costForm.splitType === opt.val ? 'rgba(114,76,249,0.05)' : 'transparent',
                    transition: 'all 0.2s',
                  }}>
                    <input type="radio" name="splitType" value={opt.val}
                      checked={costForm.splitType === opt.val}
                      onChange={() => setCostForm({ ...costForm, splitType: opt.val })}
                      style={{ marginTop: '0.15rem', accentColor: 'var(--primary)' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: costForm.splitType === opt.val ? 'var(--primary)' : 'var(--text-main)' }}>{opt.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.hint}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Setup Split →'}
            </button>
          </form>
        </div>

        {/* Step 2: Preview */}
        <div className="card" style={{ flex: 1.5, minWidth: 280 }}>
          <h3 className="section-title">2. {t('reviewGenerate')}</h3>
          {!previewData ? (
            <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
              <p>Setup the bill on the left first.</p>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: '0.6rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 700 }}>{costForm.title}</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>Rs. {previewData.totalAmount}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mode: <strong>{previewData.splitType}</strong></p>
              </div>

              {/* CUSTOM: running % total */}
              {previewData.splitType === 'CUSTOM' && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.6rem', border: `2px solid ${customBarColor}`, background: `${customBarColor}10` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: customBarColor }}>
                      {customTotal.toFixed(1)}% assigned
                    </span>
                    <span style={{ fontSize: '0.8rem', color: customRemaining < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {customRemaining < 0 ? `${Math.abs(customRemaining).toFixed(1)}% over` : `${customRemaining.toFixed(1)}% remaining`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(customTotal, 100)}%`, background: customBarColor, borderRadius: 99, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              {/* MANUAL: running Rs. total */}
              {previewData.splitType === 'MANUAL' && (
                <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.6rem', border: `2px solid ${manualBarColor}`, background: `${manualBarColor}10` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: manualBarColor }}>
                      Rs. {manualTotal.toFixed(2)} assigned
                    </span>
                    <span style={{ fontSize: '0.8rem', color: manualRemaining < 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
                      {manualRemaining < 0
                        ? `Rs. ${Math.abs(manualRemaining).toFixed(2)} over`
                        : `Rs. ${manualRemaining.toFixed(2)} remaining`}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min((manualTotal / previewData.totalAmount) * 100, 100)}%`, background: manualBarColor, borderRadius: 99, transition: 'width 0.2s' }} />
                  </div>
                </div>
              )}

              {/* Allocations table */}
              <table className="bms-table" style={{ marginBottom: '1.25rem' }}>
                <thead>
                  <tr>
                    <th>Tenant</th>
                    <th>Room</th>
                    <th>
                      {previewData.splitType === 'EVEN'   ? 'Amount (Rs.)' :
                       previewData.splitType === 'CUSTOM' ? 'Percentage (%)' : 'Amount (Rs.)'}
                    </th>
                    {previewData.splitType === 'CUSTOM' && <th>Rs. Value</th>}
                  </tr>
                </thead>
                <tbody>
                  {previewData.allocations.map(alloc => {
                    const inputVal = Number(dynamicInputs[alloc.tenantId]) || 0;
                    const customRsValue = previewData.splitType === 'CUSTOM'
                      ? ((inputVal / 100) * previewData.totalAmount).toFixed(2)
                      : null;

                    return (
                      <tr key={alloc.tenantId}>
                        <td style={{ fontWeight: 600 }}>{alloc.tenantName}</td>
                        <td>{alloc.roomNumber}</td>
                        <td>
                          {previewData.splitType === 'EVEN' ? (
                            <strong style={{ color: 'var(--primary)' }}>Rs. {alloc.allocatedAmount}</strong>
                          ) : (
                            <input
                              type="number"
                              className="form-input"
                              value={dynamicInputs[alloc.tenantId]}
                              onChange={e => setDynamicInputs({ ...dynamicInputs, [alloc.tenantId]: e.target.value })}
                              placeholder={previewData.splitType === 'CUSTOM' ? 'e.g. 50' : 'e.g. 2500'}
                              min="0"
                              style={{ width: 110, padding: '0.3rem 0.5rem' }}
                            />
                          )}
                        </td>
                        {/* Real-time Rs. value preview for CUSTOM split */}
                        {previewData.splitType === 'CUSTOM' && (
                          <td style={{ fontWeight: 700, color: inputVal > 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {inputVal > 0 ? `Rs. ${customRsValue}` : '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <button
                className="btn btn-success"
                style={{ width: '100%', padding: '0.75rem' }}
                onClick={handleGenerateCharges}
                disabled={isProcessing}
              >
                {isProcessing ? 'Generating...' : 'Confirm & Generate Bills ✓'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;