import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const RecordPaymentModal = ({ isOpen, onClose, tenantId, chargeLineId, onSuccess }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [method, setMethod] = useState('CASH');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        tenantId,
        amountPaid: Number(amountPaid),
        method,
        // If they clicked a specific charge, link it so the backend marks it PAID
        ...(chargeLineId && { chargeLineId }) 
      };

      await axiosInstance.post('/payments', payload);
      
      toast.success('Payment recorded successfully!');
      setAmountPaid(''); // Reset form
      onSuccess();       // Tell the parent component to refresh the data
      onClose();         // Close the modal
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modal overlay styling
  const overlayStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px'
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Record Payment</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Amount Paid (Rs.)</label>
            <input 
              type="number" 
              className="form-input" 
              value={amountPaid} 
              onChange={(e) => setAmountPaid(e.target.value)} 
              min="1" 
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Payment Method</label>
            <select 
              className="form-input" 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;