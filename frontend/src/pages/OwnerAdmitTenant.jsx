import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';

const PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

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

  const validate = () => {
    if (!formData.fullName.trim())   return t('fullName') + ' is required.';
    if (!formData.nicNumber.trim())  return t('nicNumber') + ' is required.';
    if (!EMAIL_REGEX.test(formData.email)) return 'Please enter a valid email address.';
    if (!formData.password.trim())   return t('tempPassword') + ' is required.';
    if (!PHONE_REGEX.test(formData.phoneNumber.trim()))
      return 'Please enter a valid Sri Lankan phone number (e.g. 0771234567).';
    if (!formData.roomId)            return 'Please select a room.';
    if (!formData.rentAmount)        return t('monthlyRent') + ' is required.';
    // Emergency number: optional, but if filled must be valid
    if (formData.emergencyNumber && !PHONE_REGEX.test(formData.emergencyNumber.trim()))
      return 'Emergency contact number must be a valid Sri Lankan phone number.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return toast.error(err);

    setSubmitting(true);
    try {
      let frontUrl = '', backUrl = '', signatureUrl = '';

      // Upload only images that were selected
      if (images.idFront || images.idBack || images.signature) {
        const toUpload = [
          images.idFront   || null,
          images.idBack    || null,
          images.signature || null,
        ];
        const results = await Promise.all(
          toUpload.map(img => {
            if (!img) return Promise.resolve(null);
            const fd = new FormData();
            fd.append('image', img);
            return axiosInstance.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          })
        );
        frontUrl     = results[0]?.data?.url || '';
        backUrl      = results[1]?.data?.url || '';
        signatureUrl = results[2]?.data?.url || '';
      }

      const tenantRes = await axiosInstance.post('/tenants', {
        fullName:               formData.fullName,
        email:                  formData.email,
        password:               formData.password,
        contactNumber:          formData.phoneNumber,
        address:                formData.address,
        nicNumber:              formData.nicNumber,
        courseOrWorkplace:      formData.courseOrWorkplace,
        emergencyContactName:   formData.emergencyName,
        emergencyContactNumber: formData.emergencyNumber,
        idFrontImageUrl:        frontUrl,
        idBackImageUrl:         backUrl,
        signatureImageUrl:      signatureUrl,
        roomId:                 formData.roomId,
        rentAmount:             formData.rentAmount,
        boardingPlaceId:        id,
      });

      if (depositAmount) {
        await axiosInstance.post('/deposits', {
          tenantId: tenantRes.data._id,
          amount: Number(depositAmount),
          minimumStayMonths: 6,
          refundEligibleDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
        });
      }

      toast.success('Tenant admitted successfully!');
      navigate(`/owner/property/${id}/tenants`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction failed.');
    } finally { setSubmitting(false); }
  };

  const FileField = ({ name, label, required }) => (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required
          ? <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>
          : <span style={{ color: 'var(--text-muted)', marginLeft: 4, fontWeight: 400 }}>({t('optional')})</span>
        }
      </label>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.65rem',
        border: `2px dashed ${images[name] ? 'var(--success)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius)', padding: '0.75rem', cursor: 'pointer',
        background: images[name] ? 'rgba(16,185,129,0.05)' : 'transparent', transition: 'all 0.2s',
      }}>
        <input type="file" name={name} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        {images[name]
          ? <><CheckCircle size={17} color="var(--success)" /><span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>{images[name].name}</span></>
          : <><Upload size={17} color="var(--text-muted)" /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('clickToUpload')}</span></>
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
        <h1 className="page-title">{t('admitNewTenant')}</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1 */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">{t('personalInfo')}</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('fullName')} *</label>
              <input type="text" className="form-input" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('nicNumber')} *</label>
              <input type="text" className="form-input" name="nicNumber" value={formData.nicNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')} *</label>
              <input type="email" className="form-input" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('tempPassword')} * <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.75rem' }}>({t('tempPasswordHint')})</span></label>
              <input type="text" className="form-input" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')} * <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>07XXXXXXXX</span></label>
              <input type="tel" className="form-input" name="phoneNumber" placeholder="0771234567" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('courseOrWorkplace')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
              <input type="text" className="form-input" name="courseOrWorkplace" value={formData.courseOrWorkplace} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('permanentAddress')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
            <input type="text" className="form-input" name="address" value={formData.address} onChange={handleChange} />
          </div>
        </div>

        {/* Section 2 */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">{t('emergencySection')} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({t('optional')})</span></h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('emergencyName')}</label>
              <input type="text" className="form-input" name="emergencyName" value={formData.emergencyName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('emergencyNumber')} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.72rem' }}>07XXXXXXXX</span></label>
              <input type="tel" className="form-input" name="emergencyNumber" placeholder="0771234567" value={formData.emergencyNumber} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <h3 className="section-title">{t('documentsSection')} <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.85rem' }}>({t('optional')})</span></h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Documents are optional but recommended for record-keeping.</p>
          <div className="grid-2">
            <FileField name="idFront"   label={t('idFront')}    required={false} />
            <FileField name="idBack"    label={t('idBack')}     required={false} />
            <FileField name="signature" label={t('signature')}  required={false} />
          </div>
        </div>

        {/* Section 4 */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="section-title">{t('financialsSection')}</h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('assignRoom')} *</label>
              <select className="form-input" name="roomId" value={formData.roomId} onChange={handleChange} required>
                <option value="" disabled>{t('selectRoom')}</option>
                {availableRooms.map(room => (
                  <option key={room._id} value={room._id}>Room {room.roomNumber} ({room.availableSpots} {t('spotsLeft')})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('monthlyRent')} *</label>
              <input type="number" className="form-input" name="rentAmount" min="0"
                value={formData.rentAmount} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('keyMoney')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
            <input type="number" className="form-input" min="0" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }} disabled={submitting}>
          {submitting ? t('uploading') : t('admitBtn')}
        </button>
      </form>
    </div>
  );
};

export default OwnerAdmitTenant;