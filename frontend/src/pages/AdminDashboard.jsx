import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State containers for our three API endpoints
  const [places, setPlaces] = useState([]);
  const [overduePlaces, setOverduePlaces] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fire all 3 requests at the same time
        const [placesRes, overdueRes, logsRes] = await Promise.all([
          axiosInstance.get('/admin/boarding-places'),
          axiosInstance.get('/admin/overdue'),
          axiosInstance.get('/notifications/log')
        ]);
        
        // Update our state with the returned Express data
        setPlaces(placesRes.data);
        setOverduePlaces(overdueRes.data);
        setLogs(logsRes.data);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
        toast.error('Failed to load dashboard data. Check your connection.');
      } finally {
        setLoading(false); // Stop the loading spinner regardless of success/fail
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Navigation / Header */}
      <header className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--primary)' }}>Admin Control Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.email}</p>
        </div>
        <button onClick={logout} className="btn btn-outline">
          Log Out
        </button>
      </header>

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          {/* Top-level Stat Cards */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ color: 'var(--text-muted)' }}>Total Boarding Places</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{places.length}</p>
            </div>
            <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <h3 style={{ color: 'var(--text-muted)' }}>Overdue Subscriptions</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--danger)' }}>
                {overduePlaces.length}
              </p>
            </div>
          </div>

          {/* Data Tables / Lists */}
          <div className="grid-2">
            {/* Left Column: All Places */}
            <div className="card">
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h3>Registered Properties</h3>
                <button onClick={() => navigate('/admin/add-property')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>+ Add</button>
              </div>
              
              {places.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No properties registered yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {places.map(place => (
                    <li key={place._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)' }}>
                      <strong>{place.name}</strong> 
                      <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Status: {place.subscriptionStatus}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Right Column: Recent Notification Logs */}
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>Recent System Alerts (Logs)</h3>
              {logs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No recent notifications.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {logs.slice(0, 5).map(log => (
                    <li key={log._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>[{log.channel}]</span> - {log.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;