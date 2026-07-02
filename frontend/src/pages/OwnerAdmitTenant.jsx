import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

const OwnerAdmitTenant = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const [availableRooms, setAvailableRooms] = useState([]);

  // 1. Expanded Form State to match Mongoose Schema
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '', 
    address: '',
    nicNumber: '',
    courseOrWorkplace: '',
    emergencyName: '',
    emergencyNumber: '',
    roomId: '',
    rentAmount: ''
  });

  // 2. State for all three required images
  const [images, setImages] = useState({
    idFront: null,
    idBack: null,
    signature: null
  });

  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axiosInstance.get(`/boarding-places/${id}/rooms`);
        const roomsWithSpace = response.data.filter(room => room.availableSpots > 0);
        setAvailableRooms(roomsWithSpace);
      } catch (error) {
        toast.error("Failed to load available rooms.");
      }
    };
    fetchRooms();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages({ ...images, [e.target.name]: e.target.files[0] });
  };

  // 3. The Upgraded Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.idFront || !images.idBack || !images.signature) {
      return toast.error("Please upload all three required images.");
    }

    try {
      // Step 1: Upload all three images concurrently
      const uploadPromises = [images.idFront, images.idBack, images.signature].map(img => {
        const imagePayload = new FormData();
        imagePayload.append('image', img);
        return axiosInstance.post('/upload', imagePayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });

      // Wait for all 3 uploads to finish
      const uploadResults = await Promise.all(uploadPromises);
      
      // Extract the URLs in the exact order we sent them
      const [frontUrl, backUrl, signatureUrl] = uploadResults.map(res => res.data.url);

      // Step 2: Create the Tenant (Perfectly mapped to Backend!)
      const tenantPayload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        contactNumber: formData.phoneNumber,
        address: formData.address,
        nicNumber: formData.nicNumber,
        courseOrWorkplace: formData.courseOrWorkplace,
        emergencyContactName: formData.emergencyName,
        emergencyContactNumber: formData.emergencyNumber,
        idFrontImageUrl: frontUrl,
        idBackImageUrl: backUrl,
        signatureImageUrl: signatureUrl,
        roomId: formData.roomId,
        rentAmount: formData.rentAmount,
        boardingPlaceId: id
      };

      const tenantRes = await axiosInstance.post('/tenants', tenantPayload);
      const newTenantId = tenantRes.data._id; 

      // Step 3: Record the Deposit (Updated to include mandatory Schema fields)
      const depositPayload = {
        tenantId: newTenantId,
        amount: Number(depositAmount),
        minimumStayMonths: 6, // Mandatory for your backend schema
        refundEligibleDate: new Date(new Date().setMonth(new Date().getMonth() + 6))
      };

      await axiosInstance.post('/deposits', depositPayload);

      toast.success('Tenant admitted and deposit recorded!');
      navigate(`/owner/property/${id}/tenants`);
      
    } catch (error) {
      console.error("Admission error:", error);
      toast.error(error.response?.data?.message || 'Transaction failed.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(`/owner/property/${id}/tenants`)} className="btn btn-outline" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Tenants List
      </button>

      <div className="card">
        <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Admit New Tenant</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* Section 1: Personal Information */}
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>1. Personal Information</h3>
          
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">NIC Number</label>
              <input type="text" className="form-input" name="nicNumber" value={formData.nicNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input type="text" className="form-input" name="password" value={formData.password} onChange={handleChange} placeholder="For tenant portal login" required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-input" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Course / Workplace</label>
              <input type="text" className="form-input" name="courseOrWorkplace" value={formData.courseOrWorkplace} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Permanent Address</label>
            <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} required />
          </div>

          {/* Section 2: Emergency Contact */}
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>2. Emergency Contact</h3>
          <div className="grid-2">
             <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input type="text" className="form-input" name="emergencyName" value={formData.emergencyName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input type="tel" className="form-input" name="emergencyNumber" value={formData.emergencyNumber} onChange={handleChange} required />
            </div>
          </div>

          {/* Section 3: Document Uploads */}
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>3. Required Documents</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">ID Front Image</label>
              <input type="file" className="form-input" name="idFront" accept="image/*" onChange={handleImageChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">ID Back Image</label>
              <input type="file" className="form-input" name="idBack" accept="image/*" onChange={handleImageChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Signature Image</label>
              <input type="file" className="form-input" name="signature" accept="image/*" onChange={handleImageChange} required />
            </div>
          </div>

          {/* Section 4: Room Assignment & Deposit */}
          <h3 style={{ marginBottom: '1rem', marginTop: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>4. Room & Financials</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign Room</label>
              <select className="form-input" name="roomId" value={formData.roomId} onChange={handleChange} required>
                <option value="" disabled>-- Select a Room --</option>
                {availableRooms.map(room => (
                  <option key={room._id} value={room._id}>
                    Room {room.roomNumber} ({room.availableSpots} spots left)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Rent Amount</label>
              <input type="number" className="form-input" name="rentAmount" min="0" value={formData.rentAmount} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Deposit Amount Paid (Key Money)</label>
            <input type="number" className="form-input" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} min="0" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1.5rem', fontSize: '1.1rem' }}>
            Admit Tenant & Record Deposit
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerAdmitTenant;