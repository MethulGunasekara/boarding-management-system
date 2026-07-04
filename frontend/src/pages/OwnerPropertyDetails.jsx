import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, AlertTriangle, CheckCircle, Users } from 'lucide-react';

const OwnerPropertyDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [property,       setProperty]       = useState(null);
  const [rooms,          setRooms]          = useState([]);
  const [overdueTenants, setOverdueTenants] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showAddRoom,    setShowAddRoom]    = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', capacity: 1 });

  useEffect(() => {
    (async () => {
      try {
        const [p, r, o] = await Promise.all([
          axiosInstance.get(`/boarding-places/${id}`),
          axiosInstance.get(`/boarding-places/${id}/rooms`),
          axiosInstance.get(`/tenants/overdue/${id}`),
        ]);
        setProperty(p.data);
        setRooms(r.data);
        setOverdueTenants(o.data);
      } catch {
        toast.error('Failed to load property details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(`/boarding-places/${id}/rooms`, newRoom);
      setRooms([...rooms, { ...res.data, activeTenants: 0, availableSpots: res.data.capacity }]);
      toast.success(`Room ${res.data.roomNumber} added!`);
      setNewRoom({ roomNumber: '', capacity: 1 });
      setShowAddRoom(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room.');
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;

  return (
    <div>
      <button onClick={() => navigate('/owner/dashboard')} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>

      {/* Property header */}
      <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <div className="flex-between">
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{property?.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{property?.address}</p>
          </div>
          <span className={`badge ${property?.subscriptionStatus === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
            {property?.subscriptionStatus}
          </span>
        </div>
      </div>

      <div className="grid-2">
        {/* Rooms */}
        <div>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>{t('rooms')}</h2>
            <button onClick={() => setShowAddRoom(!showAddRoom)} className="btn btn-primary btn-sm">
              <Plus size={14} /> {showAddRoom ? 'Cancel' : t('addRoom')}
            </button>
          </div>

          {showAddRoom && (
            <form onSubmit={handleAddRoom} className="card" style={{ marginBottom: '1rem', background: 'var(--bg-surface)' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input type="text" className="form-input" placeholder="e.g., A1"
                    value={newRoom.roomNumber} onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('capacity')} (Beds)</label>
                  <input type="number" className="form-input"
                    value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: e.target.value })} min="1" required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t('save')}</button>
            </form>
          )}

          {rooms.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No rooms added yet.</p>
          ) : (
            <div className="room-grid">
              {rooms.map(room => {
                const full = room.availableSpots <= 0;
                const pct  = Math.round(((room.capacity - (room.availableSpots || 0)) / room.capacity) * 100);
                return (
                  <div key={room._id} className={`room-card${full ? ' room-card-full' : ''}`}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Room {room.roomNumber}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Cap: {room.capacity}</p>
                    <div className="room-bar-track">
                      <div className="room-bar-fill" style={{ width: `${pct}%`, background: full ? 'var(--danger)' : 'var(--primary)' }} />
                    </div>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, color: full ? 'var(--danger)' : 'var(--success)' }}>
                      {full ? 'Full' : `${room.availableSpots} ${t('available')}`}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alerts & Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {overdueTenants.length > 0 ? (
            <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)' }}>
                  {overdueTenants.length} Overdue Tenant(s)
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {overdueTenants.map(tenant => (
                  <div key={tenant._id} style={{ padding: '0.5rem 0.75rem', background: 'var(--bg-surface)', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    <strong>{tenant.fullName}</strong>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Room {tenant.room?.roomNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card" style={{ borderLeft: '4px solid var(--success)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={22} color="var(--success)" />
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--success)' }}>All Clear</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tenants are currently overdue.</p>
              </div>
            </div>
          )}

          <button className="btn btn-primary" style={{ padding: '0.85rem', justifyContent: 'center' }}
            onClick={() => navigate(`/owner/property/${id}/tenants`)}>
            <Users size={16} /> View & Manage All Tenants →
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerPropertyDetails;