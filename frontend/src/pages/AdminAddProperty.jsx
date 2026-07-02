import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';


const AdminAddProperty = () => {
  const navigate = useNavigate();
  
  // State for the dropdown options
  const [owners, setOwners] = useState([]);
  
  // State for the form payload
  const [formData, setFormData] = useState({
    ownerId: '',
    name: '',
    address: '',
    subscriptionMonths: 1
  });

  // 1. Fetch owners when the page loads
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await axiosInstance.get('/admin/users');
        // Filter the response so only Owners appear in the dropdown
        const onlyOwners = response.data.filter(user => user.role === 'OWNER');
        setOwners(onlyOwners);
      } catch (error) {
        toast.error('Failed to load owners list.');
      }
    };
    fetchOwners();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/admin/boarding-places', formData);
      toast.success('Property registered and subscription activated!');
      navigate('/admin/dashboard'); // Send them back to the control center
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register property.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/admin/dashboard')} 
        className="btn btn-outline" 
        style={{ marginBottom: '1.5rem' }}
      >
        &larr; Back to Dashboard
      </button>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Register New Boarding Place</h2>
        
        {/* We will attach the onSubmit handler in the next step */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Owner</label>
            <select 
              className="form-input" 
              name="ownerId" 
              value={formData.ownerId} 
              onChange={handleChange}
              required
            >
              <option value="" disabled>-- Choose an Owner --</option>
              {owners.map(owner => (
                <option key={owner._id} value={owner._id}>
                  {owner.fullName} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Property Name</label>
            <input 
              type="text" 
              className="form-input" 
              name="name"
              placeholder="e.g., Green Valley Boarding"
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
            <label className="form-label">Initial Subscription (Months)</label>
            <input 
              type="number" 
              className="form-input" 
              name="subscriptionMonths"
              min="1"
              value={formData.subscriptionMonths}
              onChange={handleChange}
              required 
            />
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