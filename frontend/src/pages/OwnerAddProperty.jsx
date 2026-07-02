import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const OwnerAddProperty = () => {
  const navigate = useNavigate();
  
  // State for the form payload
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 0 // Optional in backend, but good to have a default
  });

  // Standard controlled-input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/boarding-places', formData);
      toast.success('Property registered successfully!');
      navigate('/owner/dashboard'); // Route them back to see their new property
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register property.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/owner/dashboard')} 
        className="btn btn-outline" 
        style={{ marginBottom: '1.5rem' }}
      >
        &larr; Back to Dashboard
      </button>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Register a New Boarding Place</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Property Name</label>
            <input 
              type="text" 
              className="form-input" 
              name="name"
              placeholder="e.g., Kamala's Annex"
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Property Address</label>
            <input 
              type="text" 
              className="form-input" 
              name="address"
              placeholder="Full street address"
              value={formData.address}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Total Capacity (Optional)</label>
            <input 
              type="number" 
              className="form-input" 
              name="capacity"
              min="0"
              value={formData.capacity}
              onChange={handleChange}
            />
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