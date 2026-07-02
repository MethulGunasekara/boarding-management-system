import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const CostDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [costForm, setCostForm] = useState({ title: '', amount: '', splitType: 'EVEN' });
  const [activeCostId, setActiveCostId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW: State to hold the dynamic inputs from the owner (percentages or exact amounts)
  const [dynamicInputs, setDynamicInputs] = useState({});

  const handleFormChange = (e) => setCostForm({ ...costForm, [e.target.name]: e.target.value });

  const handleCalculateSplit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const costPayload = { boardingPlaceId: id, title: costForm.title, amount: Number(costForm.amount), splitType: costForm.splitType };
      const costRes = await axiosInstance.post('/costs', costPayload);
      setActiveCostId(costRes.data._id);

      const previewRes = await axiosInstance.get(`/costs/${costRes.data._id}/allocations`);
      setPreviewData(previewRes.data);
      
      // Reset dynamic inputs
      const initialInputs = {};
      previewRes.data.allocations.forEach(alloc => initialInputs[alloc.tenantId] = '');
      setDynamicInputs(initialInputs);
      
      toast.success('Ready for review!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate split');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (tenantId, value) => {
    setDynamicInputs({ ...dynamicInputs, [tenantId]: value });
  };

  const handleGenerateCharges = async () => {
    // Math Validation Before Sending to Backend
    let finalAllocations = [];
    
    if (previewData.splitType === 'EVEN') {
      finalAllocations = previewData.allocations.map(a => ({ tenantId: a.tenantId, amount: a.allocatedAmount }));
    } else if (previewData.splitType === 'CUSTOM') {
      // CUSTOM = Percentages. We calculate the exact Rs amount here.
      let totalPercentage = 0;
      finalAllocations = previewData.allocations.map(a => {
        const percent = Number(dynamicInputs[a.tenantId]) || 0;
        totalPercentage += percent;
        return { tenantId: a.tenantId, amount: Number(((percent / 100) * previewData.totalAmount).toFixed(2)) };
      });
      if (totalPercentage !== 100) return toast.error(`Percentages must add up to 100%. Currently: ${totalPercentage}%`);
    } else if (previewData.splitType === 'MANUAL') {
      // MANUAL = Exact Amounts.
      let totalManual = 0;
      finalAllocations = previewData.allocations.map(a => {
        const amt = Number(dynamicInputs[a.tenantId]) || 0;
        totalManual += amt;
        return { tenantId: a.tenantId, amount: amt };
      });
      if (totalManual !== previewData.totalAmount) return toast.error(`Amounts must add up to Rs.${previewData.totalAmount}. Currently: Rs.${totalManual}`);
    }

    setIsProcessing(true);
    try {
      await axiosInstance.post(`/costs/${activeCostId}/charges`, { allocations: finalAllocations });
      toast.success('Bills generated successfully!');
      navigate(`/owner/property/${id}`);
    } catch (error) {
      toast.error('Failed to generate charges');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>&larr; Back</button>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN */}
        <div className="card" style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>1. Create New Bill</h2>
          <form onSubmit={handleCalculateSplit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Bill Title</label>
              <input type="text" name="title" value={costForm.title} onChange={handleFormChange} className="form-input" required />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Total Amount (Rs.)</label>
              <input type="number" name="amount" value={costForm.amount} onChange={handleFormChange} className="form-input" min="1" required />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Split Method</label>
              <select name="splitType" value={costForm.splitType} onChange={handleFormChange} className="form-input">
                <option value="EVEN">Even (Divide equally)</option>
                <option value="CUSTOM">Custom (By Percentage %)</option>
                <option value="MANUAL">Manual (Exact Rs. Amounts)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Setup Split \u2192'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN */}
        <div className="card" style={{ flex: 1.5, minHeight: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>2. Review & Generate</h2>
          {!previewData ? (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '4rem' }}>Setup the bill on the left first.</p>
          ) : (
            <div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <p><strong>Total Bill:</strong> Rs. {previewData.totalAmount}</p>
                <p><strong>Mode:</strong> {previewData.splitType}</p>
              </div>

              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                <thead>
                  <tr>
                    <th style={{ paddingBottom: '0.5rem' }}>Tenant</th>
                    <th style={{ paddingBottom: '0.5rem' }}>Room</th>
                    <th style={{ paddingBottom: '0.5rem' }}>
                      {previewData.splitType === 'EVEN' ? 'Amount (Rs)' : previewData.splitType === 'CUSTOM' ? 'Percentage (%)' : 'Amount (Rs)'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.allocations.map((alloc) => (
                    <tr key={alloc.tenantId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0' }}>{alloc.tenantName}</td>
                      <td style={{ padding: '0.75rem 0' }}>{alloc.roomNumber}</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        {previewData.splitType === 'EVEN' ? (
                          <strong>Rs. {alloc.allocatedAmount}</strong>
                        ) : (
                          <input 
                            type="number" 
                            className="form-input" 
                            value={dynamicInputs[alloc.tenantId]} 
                            onChange={(e) => handleInputChange(alloc.tenantId, e.target.value)}
                            placeholder={previewData.splitType === 'CUSTOM' ? "e.g. 50" : "e.g. 2500"}
                            style={{ width: '120px', padding: '0.25rem' }}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleGenerateCharges} className="btn btn-primary" style={{ width: '100%', backgroundColor: 'var(--success)' }} disabled={isProcessing}>
                Confirm & Generate Bills
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostDashboard;