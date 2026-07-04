import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const TenantDashboard = () => {
  const navigate = useNavigate();
  const { t }    = useLang();
  const userInfo = JSON.parse(localStorage.getItem('bms_user'));

  const [charges,     setCharges]     = useState([]);
  const [totalDue,    setTotalDue]    = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [activeBill,  setActiveBill]  = useState(null);
  const [proofFile,   setProofFile]   = useState(null);
  const [isSubmitting,setIsSubmitting]= useState(false);

  const fetchMyBills = async () => {
    try {
      const res = await axiosInstance.get('/portal/my-charges');
      setCharges(res.data.charges);
      setTotalDue(res.data.totalDue);
    } catch {
      toast.error('Failed to load your bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo || userInfo.role !== 'TENANT') { navigate('/tenant/login'); return; }
    fetchMyBills();
  }, []);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!proofFile) return toast.error('Please select an image file first.');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', proofFile);
      const uploadRes = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await axiosInstance.post(`/portal/charges/${activeBill._id}/pay`, { proofUrl: uploadRes.data.url });
      toast.success('Payment submitted for review!');
      setActiveBill(null);
      setProofFile(null);
      fetchMyBills();
    } catch {
      toast.error('Failed to submit payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {userInfo.fullName?.split(' ')[0]}!</h1>
        <p className="page-sub">
          {userInfo.boardingPlace?.name} • Room {userInfo.room?.roomNumber}
        </p>
      </div>

      {/* Balance card */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className={`stat-card`} style={{ borderLeft: `4px solid ${totalDue > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
          <div className={`stat-icon ${totalDue > 0 ? 'stat-icon-danger' : 'stat-icon-success'}`}>
            {totalDue > 0 ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
          </div>
          <div>
            <div className="stat-value" style={{ color: totalDue > 0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.5rem' }}>
              {totalDue > 0 ? `Rs. ${totalDue}` : 'All Clear!'}
            </div>
            <div className="stat-label">
              {totalDue > 0 ? 'Outstanding Balance' : 'No outstanding balance'}
            </div>
          </div>
        </div>
      </div>

      {/* Bills table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.95rem' }}>
          {t('myBills')}
        </div>
        {loading ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>{t('loading')}</p>
        ) : charges.length === 0 ? (
          <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>No bills recorded yet.</p>
        ) : (
          <table className="bms-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {charges.map(charge => (
                <tr key={charge._id}>
                  <td>{new Date(charge.dueDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>
                    {charge.type === 'RENT' ? 'Monthly Rent' : charge.costReference?.title || 'Shared Bill'}
                  </td>
                  <td style={{ fontWeight: charge.status === 'PENDING' ? 700 : 400 }}>Rs. {charge.amountDue}</td>
                  <td>
                    {charge.status === 'PENDING' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveBill(charge)}>
                        Pay Now
                      </button>
                    ) : (
                      <span className={`badge ${
                        charge.status === 'UNDER_REVIEW' ? 'badge-info' :
                        charge.status === 'PAID'         ? 'badge-success' : 'badge-muted'
                      }`}>{charge.status.replace('_', ' ')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment upload modal */}
      {activeBill && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 800 }}>Submit Payment</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Paying Rs. {activeBill.amountDue} for {activeBill.type === 'RENT' ? 'Rent' : activeBill.costReference?.title}
            </p>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Upload Bank Transfer Receipt</label>
                <input type="file" accept="image/*" className="form-input"
                  onChange={e => setProofFile(e.target.files[0])} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => { setActiveBill(null); setProofFile(null); }}
                  disabled={isSubmitting}>
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