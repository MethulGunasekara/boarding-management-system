import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('bms_user')); // Matching your AuthContext key!

  const [charges, setCharges] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [activeBill, setActiveBill] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyBills = async () => {
    try {
      const res = await axiosInstance.get('/portal/my-charges');
      setCharges(res.data.charges);
      setTotalDue(res.data.totalDue);
    } catch (error) {
      toast.error('Failed to load your bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'TENANT') {
      navigate('/tenant/login');
      return;
    }
    fetchMyBills();
  }, [navigate, userInfo]);

  const handleLogout = () => {
    localStorage.removeItem('bms_user');
    navigate('/tenant/login');
  };

  // --- NEW: Payment Submission Logic ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) return toast.error("Please select an image file first.");

    setIsSubmitting(true);
    try {
      // 1. Upload the image to your existing upload route
      const formData = new FormData();
      formData.append('image', proofFile);
      
      const uploadRes = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const proofUrl = uploadRes.data.url;

      // 2. Submit the payment to our brand new portal route
      await axiosInstance.post(`/portal/charges/${activeBill._id}/pay`, { proofUrl });

      toast.success('Payment submitted for review!');
      setActiveBill(null); // Close modal
      setProofFile(null); // Clear file
      fetchMyBills(); // Refresh the table so it says UNDER_REVIEW

    } catch (error) {
      console.error(error);
      toast.error('Failed to submit payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>Welcome, {userInfo.fullName}</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {userInfo.boardingPlace?.name} • Room {userInfo.room?.roomNumber}
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-outline">Logout</button>
      </div>

      <div className="grid-2">
        {/* Left Column: Balance */}
        <div>
          <div className="card" style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '0.5rem' }}>Outstanding Balance</h3>
            <h1 style={{ color: totalDue > 0 ? 'var(--danger)' : 'var(--success)', margin: '0 0 1rem 0', fontSize: '2.5rem' }}>
              Rs. {totalDue}
            </h1>
            {totalDue > 0 ? (
              <p style={{ fontSize: '0.9rem' }}>You have unpaid bills. Please check your charge history.</p>
            ) : (
              <p style={{ fontSize: '0.9rem', color: 'var(--success)' }}>You are all caught up!</p>
            )}
          </div>
        </div>

        {/* Right Column: Charge History */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>My Bills</h3>
          
          {loading ? (
            <p>Loading your bills...</p>
          ) : charges.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No bills recorded yet.</p>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ paddingBottom: '0.5rem' }}>Date</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Description</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Amount</th>
                  <th style={{ paddingBottom: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((charge) => (
                  <tr key={charge._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 0' }}>{new Date(charge.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 0' }}>
                      {charge.type === 'RENT' ? 'Monthly Rent' : charge.costReference?.title || 'Shared Bill'}
                    </td>
                    <td style={{ padding: '1rem 0', fontWeight: charge.status === 'PENDING' ? 'bold' : 'normal' }}>
                      Rs. {charge.amountDue}
                    </td>
                    <td style={{ padding: '1rem 0' }}>
                      {charge.status === 'PENDING' ? (
                        <button 
                          onClick={() => setActiveBill(charge)}
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          backgroundColor: charge.status === 'UNDER_REVIEW' ? '#cff4fc' : '#d1e7dd',
                          color: charge.status === 'UNDER_REVIEW' ? '#055160' : '#0f5132'
                        }}>
                          {charge.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* NEW: Payment Modal */}
      {activeBill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Submit Payment</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
              Paying Rs. {activeBill.amountDue} for {activeBill.type === 'RENT' ? 'Rent' : activeBill.costReference?.title}
            </p>
            
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Upload Bank Transfer Receipt</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="form-input" 
                  onChange={(e) => setProofFile(e.target.files[0])}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => { setActiveBill(null); setProofFile(null); }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenantDashboard;