import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const AdminAddProperty = () => {
  const navigate = useNavigate();
  const { t }    = useLang();
  const [owners, setOwners] = useState([]);
  const [formData, setFormData] = useState({ ownerId: '', name: '', address: '', subscriptionMonths: 1 });

  useEffect(() => {
    axiosInstance.get('/admin/users')
      .then(res => setOwners(res.data.filter(u => u.role === 'OWNER')))
      .catch(() => toast.error('Failed to load owners list.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/boarding-places', formData);
      toast.success('Property registered and subscription activated!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register property.');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => navigate('/admin/dashboard')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>

      <div className="page-header">
        <h1 className="page-title">Register New Boarding Place</h1>
        <p className="page-sub">Create a property and link it to an owner's account</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Owner</label>
            <select className="form-input" value={formData.ownerId}
              onChange={e => setFormData({ ...formData, ownerId: e.target.value })} required>
              <option value="" disabled>-- Choose an Owner --</option>
              {owners.map(o => (
                <option key={o._id} value={o._id}>{o.fullName} ({o.email})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Property Name</label>
            <input type="text" className="form-input" placeholder="e.g., Green Valley Boarding"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="form-group">
            <label className="form-label">Property Address</label>
            <input type="text" className="form-input" placeholder="Full street address"
              value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Initial Subscription (Months)</label>
            <input type="number" className="form-input" min="1"
              value={formData.subscriptionMonths}
              onChange={e => setFormData({ ...formData, subscriptionMonths: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Create Property & Activate Subscription
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProperty;