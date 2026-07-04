import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const OwnerAddProperty = () => {
  const navigate = useNavigate();
  const { t }    = useLang();
  const [formData, setFormData] = useState({ name: '', address: '', capacity: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/boarding-places', formData);
      toast.success('Property registered successfully!');
      navigate('/owner/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register property.');
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>

      <div className="page-header">
        <h1 className="page-title">Register a New Boarding Place</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property Name</label>
            <input type="text" className="form-input" placeholder="e.g., Kamala's Annex"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Property Address</label>
            <input type="text" className="form-input" placeholder="Full street address"
              value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Total Capacity (Optional)</label>
            <input type="number" className="form-input" min="0"
              value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Register Property
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerAddProperty;