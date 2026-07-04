import { useState } from 'react';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const RecordPaymentModal = ({ isOpen, onClose, tenantId, chargeLineId, onSuccess }) => {
  const [amountPaid,   setAmountPaid]   = useState('');
  const [method,       setMethod]       = useState('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLang();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axiosInstance.post('/payments', {
        tenantId,
        amountPaid: Number(amountPaid),
        method,
        ...(chargeLineId && { chargeLineId }),
      });
      toast.success('Payment recorded successfully!');
      setAmountPaid('');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>{t('recordPayment')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Amount Paid (Rs.)</label>
            <input type="number" className="form-input"
              value={amountPaid} onChange={e => setAmountPaid(e.target.value)} min="1" required />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">{t('paymentMethod')}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
              {[
                { val: 'CASH',          label: t('cash') },
                { val: 'BANK_TRANSFER', label: t('bankTransfer') },
              ].map(m => (
                <label key={m.val} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.65rem 0.85rem', border: `2px solid ${method === m.val ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: '0.6rem', cursor: 'pointer', background: method === m.val ? 'rgba(114,76,249,0.06)' : 'transparent',
                  transition: 'all 0.2s', fontSize: '0.875rem', fontWeight: 500,
                }}>
                  <input type="radio" name="method" value={m.val} checked={method === m.val}
                    onChange={() => setMethod(m.val)} style={{ accentColor: 'var(--primary)' }} />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }} disabled={isSubmitting}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
              {isSubmitting ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;