import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

const OwnerAdmitTenant = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', phoneNumber: '',
    address: '', nicNumber: '', courseOrWorkplace: '',
    emergencyName: '', emergencyNumber: '', roomId: '', rentAmount: '',
  });
  const [images,        setImages]        = useState({ idFront: null, idBack: null, signature: null });
  const [depositAmount, setDepositAmount] = useState('');
  const [submitting,    setSubmitting]    = useState(false);

  useEffect(() => {
    axiosInstance.get(`/boarding-places/${id}/rooms`)
      .then(res => setAvailableRooms(res.data.filter(r => r.availableSpots > 0)))
      .catch(() => toast.error('Failed to load available rooms.'));
  }, [id]);

  const handleChange      = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleImageChange = e => setImages({ ...images, [e.target.name]: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Manual validation — avoids the hidden-input focus error
    if (!images.idFront || !images.idBack || !images.signature) {
      return toast.error('Please upload all three required images (ID Front, ID Back, Signature).');
    }
    setSubmitting(true);
    try {
      const uploadResults = await Promise.all(
        [images.idFront, images.idBack, images.signature].map(img => {
          const fd = new FormData();
          fd.append('image', img);
          return axiosInstance.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        })
      );
      const [frontUrl, backUrl, signatureUrl] = uploadResults.map(r => r.data.url);

      const tenantRes = await axiosInstance.post('/tenants', {
        fullName: formData.fullName, email: formData.email, password: formData.password,
        contactNumber: formData.phoneNumber, address: formData.address, nicNumber: formData.nicNumber,
        courseOrWorkplace: formData.courseOrWorkplace,
        emergencyContactName: formData.emergencyName, emergencyContactNumber: formData.emergencyNumber,
        idFrontImageUrl: frontUrl, idBackImageUrl: backUrl, signatureImageUrl: signatureUrl,
        roomId: formData.roomId, rentAmount: formData.rentAmount, boardingPlaceId: id,
      });

      await axiosInstance.post('/deposits', {
        tenantId: tenantRes.data._id,
        amount: Number(depositAmount),
        minimumStayMonths: 6,
        refundEligibleDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      });

      toast.success('Tenant admitted and deposit recorded!');
      navigate(`/owner/property/${id}/tenants`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // File field — NO required attribute on the hidden input
  const FileField = ({ name, label }) => (
    <div className="form-group">
      <label className="form-label">
        {label}
        {!images[name] && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
      </label>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        border: `2px dashed ${images[name] ? 'var(--success)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius)', padding: '0.75rem', cursor: 'pointer',
        background: images[name] ? 'rgba(16,185,129,0.05)' : 'transparent',
        transition: 'all 0.2s',
      }}>
        {/* No `required` here — validation is done manually in handleSubmit */}
        <input
          type="file"
          name={name}
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        {images[name]
          ? <><CheckCircle size={17} color="var(--success)" /><span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{images[name].name}</span></>
          : <><Upload size={17} color="var(--text-muted)" /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click to upload</span></>
        }
      </label>
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      <button onClick={() => navigate(`/owner/property/${id}/tenants`)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> Back to Tenants
      </button>
      <div className="page-header">
        <h1 className="page-title">{t('admitTenant')}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">1. Personal Information</h3>
          <div className="grid-2">
            {[
              { name: 'fullName',          label: 'Full Name',           type: 'text'  },
              { name: 'nicNumber',         label: 'NIC Number',          type: 'text'  },
              { name: 'email',             label: 'Email',               type: 'email' },
              { name: 'password',          label: 'Temporary Password',  type: 'text'  },
              { name: 'phoneNumber',       label: 'Phone Number',        type: 'tel'   },
              { name: 'courseOrWorkplace', label: 'Course / Workplace',  type: 'text'  },
            ].map(f => (
              <div key={f.name} className="form-group">
                <label className="form-label">{f.label}</label>
                <input type={f.type} className="form-input" name={f.name}
                  value={formData[f.name]} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Permanent Address</label>
            <input type="text" className="form-input" name="address"
              value={formData.address} onChange={handleChange} required />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">2. Emergency Contact</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input type="text" className="form-input" name="emergencyName"
                value={formData.emergencyName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input type="tel" className="form-input" name="emergencyNumber"
                value={formData.emergencyNumber} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">3. Required Documents</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>All three documents are required before submission.</p>
          <div className="grid-2">
            <FileField name="idFront"   label="ID Front Image" />
            <FileField name="idBack"    label="ID Back Image" />
            <FileField name="signature" label="Signature Image" />
          </div>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="section-title">4. Room & Financials</h3>
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
              <label className="form-label">Monthly Rent Amount (Rs.)</label>
              <input type="number" className="form-input" name="rentAmount" min="0"
                value={formData.rentAmount} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deposit Amount Paid / Key Money (Rs.)</label>
            <input type="number" className="form-input" min="0"
              value={depositAmount} onChange={e => setDepositAmount(e.target.value)} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
          disabled={submitting}>
          {submitting ? 'Uploading & Saving...' : 'Admit Tenant & Record Deposit'}
        </button>
      </form>
    </div>
  );
};

export default OwnerAdmitTenant;