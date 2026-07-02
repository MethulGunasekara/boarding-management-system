import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const OwnerPropertyDetails = () => {
  const { id } = useParams(); // Extracts the :id from the URL
  const navigate = useNavigate();

  // State for the three data domains we will fetch
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [overdueTenants, setOverdueTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the inline "Add Room" form
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', capacity: 1 });

  useEffect(() => {
    const fetchPropertyData = async () => {
      try {
        const [propRes, roomsRes, overdueRes] = await Promise.all([
          axiosInstance.get(`/boarding-places/${id}`),
          axiosInstance.get(`/boarding-places/${id}/rooms`),
          axiosInstance.get(`/tenants/overdue/${id}`)
        ]);

        setProperty(propRes.data);
        setRooms(roomsRes.data);
        setOverdueTenants(overdueRes.data);
      } catch (error) {
        console.error("Error fetching property data:", error);
        toast.error('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]); // Dependency array includes the URL parameter

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      // Send the POST request to your Express controller
      const response = await axiosInstance.post(`/boarding-places/${id}/rooms`, newRoom);
      
      // We manually add the count fields so the UI doesn't break before the next hard refresh
      const createdRoom = {
        ...response.data,
        activeTenants: 0,
        availableSpots: response.data.capacity
      };

      // Append the new room to our existing list in state
      setRooms([...rooms, createdRoom]);
      toast.success(`Room ${createdRoom.roomNumber} added successfully!`);
      
      // Reset the form state and hide the form
      setNewRoom({ roomNumber: '', capacity: 1 });
      setShowAddRoom(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add room.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/owner/dashboard')} 
        className="btn btn-outline" 
        style={{ marginBottom: '1.5rem' }}
      >
        &larr; Back to Dashboard
      </button>

      {loading ? (
        <p>Loading property details...</p>
      ) : (
        <>
          {/* Header Section */}
          <header className="card" style={{ marginBottom: '2rem', borderTop: '4px solid var(--primary)' }}>
            <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{property?.name}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{property?.address}</p>
          </header>

          <div className="grid-2">
            {/* Left Column: Rooms Management */}
            <div>
              <div className="flex-between" style={{ marginBottom: '1rem' }}>
                <h2>Rooms</h2>
                <button 
                  onClick={() => setShowAddRoom(!showAddRoom)} 
                  className="btn btn-primary"
                >
                  {showAddRoom ? 'Cancel' : '+ Add Room'}
                </button>
              </div>

              {/* Inline Add Room Form */}
              {showAddRoom && (
                <form onSubmit={handleAddRoom} className="card" style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Room Number / Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={newRoom.roomNumber}
                        onChange={(e) => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                        placeholder="e.g., A1" required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Capacity (Beds)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                        min="1" required 
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Room</button>
                </form>
              )}

              {/* Rooms List */}
              {rooms.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No rooms added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {rooms.map(room => (
                    <div key={room._id} className="card flex-between">
                      <div>
                        <h3 style={{ marginBottom: '0.25rem' }}>Room {room.roomNumber}</h3>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                          Capacity: {room.capacity}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: room.availableSpots > 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {room.availableSpots} spots available
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Alerts & Quick Actions */}
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Alerts</h2>
              
              {overdueTenants.length > 0 ? (
                <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
                  <h3 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>
                    {overdueTenants.length} Overdue Tenant(s)
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {overdueTenants.map(tenant => (
                      <li key={tenant._id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                        <strong>{tenant.fullName}</strong> (Room {tenant.room.roomNumber})
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <h3 style={{ color: 'var(--success)' }}>All Clear</h3>
                  <p style={{ fontSize: '0.875rem' }}>No tenants are currently overdue.</p>
                </div>
              )}

              {/* A placeholder for our next big feature */}
              <button 
                className="btn btn-outline" 
                style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
                onClick={() => navigate(`/owner/property/${id}/tenants`)}
              >
                View & Manage All Tenants &rarr;
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerPropertyDetails;