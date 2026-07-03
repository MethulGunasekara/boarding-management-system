import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const OwnerDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State for the properties this owner manages
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyProperties = async () => {
      try {
        const response = await axiosInstance.get('/boarding-places/my-places');
        setPlaces(response.data);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
        toast.error('Failed to load your properties.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Navigation / Header */}
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>My Boarding Places</h1>
          <p style={{ color: 'var(--text-muted)' }}>Logged in as {user?.email}</p>
        </div>
        <button onClick={logout} className="btn btn-outline">
          Log Out
        </button>
      </header>

      {/* Main Content Area */}
      {loading ? (
        <p>Loading your properties...</p>
      ) : (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2>Select a Property</h2>
            
            {/* NEW: Button Group for Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => navigate('/owner/approvals')} 
                className="btn btn-outline"
                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
              >
                ✓ Review Payments
              </button>
              <button 
                onClick={() => navigate('/owner/add-property')} 
                className="btn btn-primary"
              >
                + Add New Property
              </button>
            </div>
          </div>

          {places.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't set up any properties yet.</h3>
              <p>Click the button above to register your first boarding place.</p>
            </div>
          ) : (
            <div className="grid-2">
              {places.map(place => (
                <div 
                  key={place._id} 
                  className="card" 
                  style={{ cursor: 'pointer', borderTop: `4px solid ${place.subscriptionStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)'}` }}
                  onClick={() => navigate(`/owner/property/${place._id}`)}
                >
                  <h3 style={{ marginBottom: '0.5rem' }}>{place.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {place.address}
                  </p>
                  
                  <div className="flex-between" style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    <span>Status: <span style={{ color: place.subscriptionStatus === 'ACTIVE' ? 'var(--success)' : 'var(--danger)' }}>{place.subscriptionStatus}</span></span>
                    <span style={{ color: 'var(--primary)' }}>Manage &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;