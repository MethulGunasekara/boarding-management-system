import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const PaymentApprovals = () => {
  const navigate = useNavigate();
  const [pendingCharges, setPendingCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = async () => {
    try {
      const res = await axiosInstance.get('/payments/pending-approvals');
      setPendingCharges(res.data);
    } catch (error) {
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReview = async (chargeId, action) => {
    setProcessingId(chargeId);
    try {
      await axiosInstance.patch(`/payments/review/${chargeId}`, { action });
      toast.success(`Payment ${action.toLowerCase()}d successfully!`);
      // Remove it from the list
      setPendingCharges(prev => prev.filter(c => c._id !== chargeId));
    } catch (error) {
      toast.error(`Failed to ${action.toLowerCase()} payment`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)' }}>Pending Payments</h1>
        <button onClick={() => navigate('/owner/dashboard')} className="btn btn-outline">
          Back to Dashboard
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading pending reviews...</p>
        ) : pendingCharges.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <h3>All caught up!</h3>
            <p>No tenants have submitted payments for review.</p>
          </div>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem 0' }}>Tenant</th>
                <th style={{ padding: '1rem 0' }}>Room</th>
                <th style={{ padding: '1rem 0' }}>Bill Details</th>
                <th style={{ padding: '1rem 0' }}>Amount</th>
                <th style={{ padding: '1rem 0' }}>Receipt</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingCharges.map((charge) => (
                <tr key={charge._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 'bold' }}>{charge.tenant?.fullName}</td>
                  <td style={{ padding: '1rem 0' }}>Room {charge.tenant?.room?.roomNumber}</td>
                  <td style={{ padding: '1rem 0' }}>
                    {charge.type === 'RENT' ? 'Monthly Rent' : charge.costReference?.title}
                  </td>
                  <td style={{ padding: '1rem 0', color: 'var(--primary)', fontWeight: 'bold' }}>
                    Rs. {charge.amountDue}
                  </td>
                  <td style={{ padding: '1rem 0' }}>
                    <a 
                      href={charge.proofOfPaymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#0ea5e9', textDecoration: 'underline' }}
                    >
                      View Receipt
                    </a>
                  </td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleReview(charge._id, 'REJECT')}
                      className="btn btn-outline"
                      style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginRight: '0.5rem', padding: '0.4rem 0.8rem' }}
                      disabled={processingId === charge._id}
                    >
                      Reject
                    </button>
                    <button 
                      onClick={() => handleReview(charge._id, 'APPROVE')}
                      className="btn btn-primary"
                      style={{ backgroundColor: 'var(--success)', padding: '0.4rem 0.8rem' }}
                      disabled={processingId === charge._id}
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentApprovals;