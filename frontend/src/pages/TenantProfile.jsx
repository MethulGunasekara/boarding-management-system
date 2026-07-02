import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import RecordPaymentModal from '../components/RecordPaymentModal';

const TenantProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tenant, setTenant] = useState(null);
  const [charges, setCharges] = useState({ charges: [], totalDue: 0 });
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState(null);

  // 1. Define the fetch function OUTSIDE the useEffect so the Modal can use it
  const fetchTenantData = async () => {
    try {
      const [tenantRes, chargesRes] = await Promise.all([
        axiosInstance.get(`/tenants/${id}`),
        axiosInstance.get(`/tenants/${id}/charges`)
      ]);
      
      setTenant(tenantRes.data);
      setCharges(chargesRes.data); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tenant data:", error);
      toast.error("Failed to load tenant details.");
      setLoading(false);
    }
  };

  // 2. Call it inside a SINGLE useEffect when the component loads
  useEffect(() => {
    fetchTenantData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleMoveOut = async () => {
    const confirm = window.confirm(
      "Are you sure you want to mark this tenant as moved out? This will void all pending charges."
    );
    
    if (!confirm) return;

    try {
      await axiosInstance.patch(`/tenants/${id}/move-out`);
      toast.success("Tenant successfully moved out.");
      setTenant(prevTenant => ({ ...prevTenant, status: 'MOVED_OUT' }));
    } catch (error) {
      console.error("Move out error:", error);
      toast.error(error.response?.data?.message || "Failed to process move out.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
        &larr; Back
      </button>

      {loading ? (
        <div>Loading profile...</div>
      ) : (
        <div className="profile-grid">
          {/* Section 1: Tenant Details */}
          <div className="card">
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{tenant.fullName}</h2>
            
            <div style={{ display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: tenant.status === 'ACTIVE' ? '#d1e7dd' : '#e2e3e5', color: tenant.status === 'ACTIVE' ? '#0f5132' : '#41464b', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
              {tenant.status}
            </div>

            <div className="grid-2">
              <div>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Personal Info</h4>
                <p style={{ marginBottom: '0.5rem' }}><strong>NIC:</strong> {tenant.nicNumber}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Email:</strong> {tenant.email}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Contact:</strong> {tenant.contactNumber}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Address:</strong> {tenant.address}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Course/Work:</strong> {tenant.courseOrWorkplace}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Rent:</strong> Rs. {tenant.monthlyRent}</p>
              </div>
              <div>
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Tenancy Details</h4>
                <p style={{ marginBottom: '0.5rem' }}><strong>Room:</strong> Room {tenant.room?.roomNumber}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Admitted:</strong> {new Date(tenant.admissionDate).toLocaleDateString()}</p>
                
                <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '1.5rem' }}>Emergency Contact</h4>
                <p style={{ marginBottom: '0.25rem' }}><strong>Name:</strong> {tenant.emergencyContact?.name}</p>
                <p style={{ marginBottom: '0.5rem' }}><strong>Number:</strong> {tenant.emergencyContact?.number}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Financials  */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Financial Summary</h3>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-light)' }}>Total Outstanding</p>
                  <h3 style={{ margin: 0, color: 'var(--danger)' }}>Rs. {charges.totalDue}</h3>
                </div>
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Charge History
            </h4>
            
            {charges.charges.length === 0 ? (
              <p>No charges recorded yet.</p>
            ) : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ paddingBottom: '0.5rem' }}>Date Due</th>
                    <th style={{ paddingBottom: '0.5rem' }}>Status</th>
                    <th style={{ paddingBottom: '0.5rem' }}>Amount</th>
                    <th style={{ paddingBottom: '0.5rem' }}>Action</th> {/* NEW HEADER */}
                  </tr>
                </thead>
                <tbody>
                  {charges.charges.map((charge) => (
                    <tr key={charge._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 0' }}>{new Date(charge.dueDate).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '4px', 
                          fontSize: '0.85rem',
                          backgroundColor: charge.status === 'PENDING' ? '#fff3cd' : '#d1e7dd',
                          color: charge.status === 'PENDING' ? '#856404' : '#0f5132'
                        }}>
                          {charge.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0' }}>Rs. {charge.amountDue}</td>
                      
                      {/* NEW ACTION COLUMN */}
                      <td style={{ padding: '0.75rem 0' }}>
                        {charge.status === 'PENDING' && (
                          <button 
                            onClick={() => {
                              setSelectedChargeId(charge._id);
                              setIsPaymentModalOpen(true);
                            }}
                            className="btn btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                          >
                            Pay This
                          </button>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Section 3: Documents */}
          <div className="card">
            <h3>Documents</h3>
            <div className="doc-grid">
              <img src={tenant.idFrontImageUrl} alt="ID Front" style={{ width: '100%' }} />
              <img src={tenant.idBackImageUrl} alt="ID Back" style={{ width: '100%' }} />
              <img src={tenant.signatureImageUrl} alt="Signature" style={{ width: '100%' }} />
            </div>
          </div>

          {/* Section 4: Actions */}
          <div className="card">
            <h3>Actions</h3>
            <button onClick={handleMoveOut} className="btn btn-danger">Move Out Tenant</button>
          </div>
        </div>
      )} 
      
      {/* 3. The comma was removed here, and the Modal is safely inside the main return div */}
      <RecordPaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedChargeId(null); // Reset it when closing
        }}
        tenantId={id}
        chargeLineId={selectedChargeId} // Pass the specific ID to the modal!
        onSuccess={fetchTenantData} 
      />
    </div>
  );
};

export default TenantProfile;