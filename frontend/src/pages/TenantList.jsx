import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const TenantList = () => {
  const { id } = useParams(); // BP ID
  const navigate = useNavigate();
  
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Calls your getTenantsByBoardingPlace controller
        const response = await axiosInstance.get(`/tenants/by-place/${id}`);
        setTenants(response.data);
      } catch (error) {
        console.error("Error fetching tenants:", error);
        toast.error('Failed to load tenants. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, [id]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/owner/property/${id}`)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Property
      </button>

      <div className="card">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2>Current Tenants</h2>
          
          {/* Wrap the buttons in a flex container so they sit side-by-side */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate(`/owner/property/${id}/costs`)} 
              className="btn btn-primary"
              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
            >
              Generate Monthly Bills
            </button>

            <button className="btn btn-primary" onClick={() => navigate(`/owner/property/${id}/admit-tenant`)}>
              + Admit New Tenant
            </button>
          </div>
          
        </div>

        {loading ? <p>Loading tenants...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Room</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>{tenant.fullName}</td>
                  <td style={{ padding: '0.75rem' }}>{tenant.room?.roomNumber || 'N/A'}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ color: tenant.status === 'ACTIVE' ? 'var(--success)' : 'var(--text-muted)' }}>
                      {tenant.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={() => navigate(`/owner/tenant/${tenant._id}`)}
                    >
                      View Profile
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

export default TenantList;