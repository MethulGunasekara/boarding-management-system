import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react';

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

  // Password change state
  const [pwForm,    setPwForm]    = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);

  const fetchMyBills = async () => {
    try {
      const res = await axiosInstance.get('/portal/my-charges');
      setCharges(res.data.charges);
      setTotalDue(res.data.totalDue);
    } catch { toast.error('Failed to load your bills.'); }
    finally { setLoading(false); }
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
      const uploadRes = await axiosInstance.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      await axiosInstance.post(`/portal/charges/${activeBill._id}/pay`, { proofUrl: uploadRes.data.url });
      toast.success('Payment submitted for review!');
      setActiveBill(null); setProofFile(null); fetchMyBills();
    } catch { toast.error('Failed to submit payment.'); }
    finally { setIsSubmitting(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw.length < 6)             return toast.error(t('passwordTooShort'));
    if (pwForm.newPw !== pwForm.confirm)      return toast.error(t('passwordMismatch'));
    setPwLoading(true);
    try {
      await axiosInstance.patch('/portal/change-password', {
        currentPassword: pwForm.current,
        newPassword:     pwForm.newPw,
      });
      toast.success(t('passwordChanged'));
      setPwForm({ current: '', newPw: '', confirm: '' });
      setShowPwSection(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t('error'));
    } finally { setPwLoading(false); }
  };

  if (!userInfo) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('welcomeTenant')}, {userInfo.fullName?.split(' ')[0]}!</h1>
        <p className="page-sub">{userInfo.boardingPlace?.name} · Room {userInfo.room?.roomNumber}</p>
      </div>

      {/* Balance card */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: `4px solid ${totalDue > 0 ? 'var(--danger)' : 'var(--success)'}` }}>
          <div className={`stat-icon ${totalDue > 0 ? 'stat-icon-danger' : 'stat-icon-success'}`}>
            {totalDue > 0 ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
          </div>
          <div>
            <div className="stat-value" style={{ color: totalDue > 0 ? 'var(--danger)' : 'var(--success)', fontSize: '1.5rem' }}>
              {totalDue > 0 ? `Rs. ${totalDue}` : t('allCaughtUp')}
            </div>
            <div className="stat-label">
              {totalDue > 0 ? t('outstandingBalance2') : t('allCaughtUpMsg')}
            </div>
          </div>
        </div>
      </div>

      {/* Bills table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.95rem' }}>
          {t('myBillsTitle')}
        </div>
        {loading ? <p style={{ padding: '2rem', color: 'var(--text-muted)' }}>{t('loading')}</p> :
         charges.length === 0 ? <p style={{ padding: '2rem', color: 'var(--text-muted)', textAlign: 'center' }}>{t('noBillsYet')}</p> : (
          <table className="bms-table">
            <thead>
              <tr><th>{t('dateCol')}</th><th>{t('description')}</th><th>{t('amountLabel')}</th><th>{t('statusCol')}</th></tr>
            </thead>
            <tbody>
              {charges.map(charge => (
                <tr key={charge._id}>
                  <td>{new Date(charge.dueDate).toLocaleDateString()}</td>
                  <td style={{ fontWeight: 500 }}>
                    {charge.type === 'RENT' ? t('monthlyRentLabel') : charge.costReference?.title || t('sharedBill')}
                  </td>
                  <td style={{ fontWeight: charge.status === 'PENDING' ? 700 : 400 }}>Rs. {charge.amountDue}</td>
                  <td>
                    {charge.status === 'PENDING' ? (
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveBill(charge)}>{t('payNow')}</button>
                    ) : (
                      <span className={`badge ${charge.status === 'UNDER_REVIEW' ? 'badge-info' : charge.status === 'PAID' ? 'badge-success' : 'badge-muted'}`}>
                        {charge.status === 'UNDER_REVIEW' ? t('underReview') : charge.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Change Password Section ── */}
      <div className="card">
        <div className="flex-between" style={{ marginBottom: showPwSection ? '1.25rem' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={17} color="var(--primary)" />
            <span style={{ fontWeight: 700 }}>{t('changePassword')}</span>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setShowPwSection(s => !s)}>
            {showPwSection ? t('cancel') : t('edit')}
          </button>
        </div>

        {showPwSection && (
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label className="form-label">{t('currentPassword')}</label>
              <input type="password" className="form-input" value={pwForm.current}
                onChange={e => setPwForm({ ...pwForm, current: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('newPassword')}</label>
              <input type="password" className="form-input" value={pwForm.newPw}
                onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">{t('confirmNewPassword')}</label>
              <input type="password" className="form-input" value={pwForm.confirm}
                onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? t('updating') : t('updatePassword')}
            </button>
          </form>
        )}
      </div>

      {/* Payment upload modal */}
      {activeBill && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: 400 }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)', fontSize: '1.1rem', fontWeight: 800 }}>{t('submitPayment')}</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Paying Rs. {activeBill.amountDue} for {activeBill.type === 'RENT' ? t('monthlyRentLabel') : activeBill.costReference?.title}
            </p>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{t('uploadReceipt')}</label>
                <input type="file" accept="image/*" className="form-input"
                  onChange={e => setProofFile(e.target.files[0])} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }}
                  onClick={() => { setActiveBill(null); setProofFile(null); }} disabled={isSubmitting}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                  {isSubmitting ? t('submitting') : t('submitBtn')}
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