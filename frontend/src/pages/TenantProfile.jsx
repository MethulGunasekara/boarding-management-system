import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';
import RecordPaymentModal from '../components/RecordPaymentModal';
import {
  ArrowLeft, CreditCard, AlertTriangle, CheckCircle,
  Calendar, Plus, X, Edit2, Upload,
} from 'lucide-react';

const PHONE_REGEX = /^(\+94|0)[0-9]{9}$/;

// ── Image upload helper ─────────────────────────────────────────────────
const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await axiosInstance.post('/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
};

// ── Edit Tenant Modal ───────────────────────────────────────────────────
const EditTenantModal = ({ tenant, rooms, onClose, onSaved, t }) => {
  const [form, setForm] = useState({
    fullName:               tenant.fullName            || '',
    email:                  tenant.email               || '',
    contactNumber:          tenant.contactNumber       || '',
    nicNumber:              tenant.nicNumber           || '',
    address:                tenant.address             || '',
    courseOrWorkplace:      tenant.courseOrWorkplace   || '',
    emergencyContactName:   tenant.emergencyContact?.name   || '',
    emergencyContactNumber: tenant.emergencyContact?.number || '',
    rentAmount:             tenant.rentAmount          || '',
    roomId:                 tenant.room?._id           || '',
  });

  // New image files (optional — only sent if owner picks a new file)
  const [newImages, setNewImages] = useState({
    idFront:   null,
    idBack:    null,
    signature: null,
  });

  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleImageChange = (e) => {
    setNewImages(p => ({ ...p, [e.target.name]: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone numbers if provided
    if (!PHONE_REGEX.test(form.contactNumber.trim())) {
      return toast.error('Please enter a valid Sri Lankan contact number (e.g. 0771234567).');
    }
    if (form.emergencyContactNumber && !PHONE_REGEX.test(form.emergencyContactNumber.trim())) {
      return toast.error('Emergency contact must be a valid Sri Lankan phone number.');
    }

    setSaving(true);
    try {
      const payload = { ...form, rentAmount: Number(form.rentAmount) };

      // Upload any new images
      if (newImages.idFront || newImages.idBack || newImages.signature) {
        setUploading(true);
        const [frontUrl, backUrl, sigUrl] = await Promise.all([
          newImages.idFront   ? uploadFile(newImages.idFront)   : Promise.resolve(null),
          newImages.idBack    ? uploadFile(newImages.idBack)    : Promise.resolve(null),
          newImages.signature ? uploadFile(newImages.signature) : Promise.resolve(null),
        ]);
        setUploading(false);
        if (frontUrl) payload.idFrontImageUrl   = frontUrl;
        if (backUrl)  payload.idBackImageUrl    = backUrl;
        if (sigUrl)   payload.signatureImageUrl = sigUrl;
      }

      await axiosInstance.patch(`/tenants/${tenant._id}`, payload);
      toast.success(t('updateSuccess'));
      onSaved();
      onClose();
    } catch (err) {
      setUploading(false);
      toast.error(err.response?.data?.message || t('error'));
    } finally {
      setSaving(false);
    }
  };

  const FileField = ({ name, label, currentUrl }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {/* Show existing image thumbnail */}
      {currentUrl && !newImages[name] && (
        <a href={currentUrl} target="_blank" rel="noreferrer">
          <img
            src={currentUrl}
            alt={label}
            style={{ height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)', marginBottom: '0.4rem', display: 'block' }}
          />
        </a>
      )}
      <label style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        border: `2px dashed ${newImages[name] ? 'var(--success)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius)', padding: '0.6rem 0.75rem', cursor: 'pointer',
        background: newImages[name] ? 'rgba(16,185,129,0.05)' : 'transparent',
        transition: 'all 0.2s', fontSize: '0.8rem',
      }}>
        <input type="file" name={name} accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
        {newImages[name]
          ? <><CheckCircle size={15} color="var(--success)" /><span style={{ color: 'var(--success)' }}>{newImages[name].name}</span></>
          : <><Upload size={15} color="var(--text-muted)" /><span style={{ color: 'var(--text-muted)' }}>{currentUrl ? 'Replace image' : 'Upload image'} (optional)</span></>
        }
      </label>
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, padding: '1rem', overflowY: 'auto',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', padding: '1.75rem' }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.1rem' }}>{t('editTenantTitle')}</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{tenant.fullName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* ── Section 1: Personal ── */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Personal Information
          </p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('tenantName')} *</label>
              <input className="form-input" value={form.fullName}
                onChange={e => set('fullName', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('nicNumber')} *</label>
              <input className="form-input" value={form.nicNumber}
                onChange={e => set('nicNumber', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('email')} *</label>
              <input type="email" className="form-input" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('phone')} * <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>07XXXXXXXX</span></label>
              <input type="tel" className="form-input" placeholder="0771234567" value={form.contactNumber}
                onChange={e => set('contactNumber', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">{t('courseOrWorkplace')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
              <input className="form-input" value={form.courseOrWorkplace}
                onChange={e => set('courseOrWorkplace', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('permanentAddress')} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({t('optional')})</span></label>
            <input className="form-input" value={form.address}
              onChange={e => set('address', e.target.value)} />
          </div>

          {/* ── Section 2: Emergency ── */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '1.25rem 0 0.75rem' }}>
            Emergency Contact <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>({t('optional')})</span>
          </p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('emergencyName')}</label>
              <input className="form-input" value={form.emergencyContactName}
                onChange={e => set('emergencyContactName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('emergencyNumber')} <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>07XXXXXXXX</span></label>
              <input type="tel" className="form-input" placeholder="0771234567" value={form.emergencyContactNumber}
                onChange={e => set('emergencyContactNumber', e.target.value)} />
            </div>
          </div>

          {/* ── Section 3: Room & Rent ── */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '1.25rem 0 0.75rem' }}>
            Room & Financials
          </p>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">{t('assignRoom')}</label>
              <select className="form-input" value={form.roomId}
                onChange={e => set('roomId', e.target.value)}>
                <option value="">-- Keep current room --</option>
                {rooms.map(r => (
                  <option key={r._id} value={r._id}>
                    Room {r.roomNumber} ({r.availableSpots ?? r.capacity} spots available)
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('monthlyRent')} *</label>
              <input type="number" className="form-input" min="0" value={form.rentAmount}
                onChange={e => set('rentAmount', e.target.value)} required />
            </div>
          </div>

          {/* ── Section 4: Documents ── */}
          <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '1.25rem 0 0.75rem' }}>
            Documents <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>— only update if you need to replace an existing file</span>
          </p>
          <div className="grid-2">
            <FileField name="idFront"   label={t('idFront')}   currentUrl={tenant.idFrontImageUrl} />
            <FileField name="idBack"    label={t('idBack')}    currentUrl={tenant.idBackImageUrl} />
            <FileField name="signature" label={t('signature')} currentUrl={tenant.signatureImageUrl} />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
              {uploading ? 'Uploading images…' : saving ? t('loading') : t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Rent Records Table ──────────────────────────────────────────────────
const RentRecordsTable = ({ tenantId, monthlyRent }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ monthKey: '', monthName: '', dueDate: '' });

  const load = useCallback(() => {
    axiosInstance.get(`/rent-records/${tenantId}`)
      .then(r => setRecords(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tenantId]);

  useEffect(() => { load(); }, [load]);

  const markPaid = async (recordId) => {
    setSaving(recordId);
    try {
      const res = await axiosInstance.patch(`/rent-records/${recordId}/pay`);
      setRecords(res.data);
      toast.success('Marked as paid. Next month record auto-generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark as paid');
    } finally { setSaving(null); }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/rent-records', {
        tenantId,
        monthName: addForm.monthName,
        monthKey:  addForm.monthKey,
        amountDue: monthlyRent,
        dueDate:   addForm.dueDate,
      });
      toast.success('Rent record added.');
      setShowAdd(false);
      setAddForm({ monthKey: '', monthName: '', dueDate: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add record');
    }
  };

  const handleDueDateChange = (dateStr) => {
    if (!dateStr) { setAddForm({ monthKey: '', monthName: '', dueDate: '' }); return; }
    const d    = new Date(dateStr);
    const key  = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const name = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    setAddForm({ monthKey: key, monthName: name, dueDate: dateStr });
  };

  return (
    <div className="card">
      <div className="flex-between" style={{ marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={16} style={{ color: 'var(--primary)' }} />
          Monthly Rent Records
        </h3>
        <button className="btn btn-outline btn-sm" onClick={() => setShowAdd(s => !s)}>
          {showAdd ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Pre-record Payment</>}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddRecord} style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Payment Due Date</label>
            <input type="date" className="form-input" style={{ width: 170 }}
              value={addForm.dueDate} onChange={e => handleDueDateChange(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Month</label>
            <input type="text" className="form-input" value={addForm.monthName} readOnly
              placeholder="Auto-filled" style={{ background: 'var(--bg-card)', cursor: 'default' }} />
          </div>
          <div>
            <label className="form-label">Amount (Rs.)</label>
            <input type="number" className="form-input" value={monthlyRent} readOnly
              style={{ background: 'var(--bg-card)', cursor: 'default', width: 120 }} />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Add Record</button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading rent records…</p>
      ) : records.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No rent records yet. Records are auto-generated monthly, or you can pre-record one above.
        </p>
      ) : (
        <table className="bms-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map(rec => (
              <tr key={rec._id}>
                <td style={{ fontWeight: 600 }}>{rec.monthName}</td>
                <td style={{ fontSize: '0.875rem' }}>{new Date(rec.dueDate).toLocaleDateString()}</td>
                <td style={{ fontWeight: 600 }}>Rs. {rec.amountDue.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    rec.status === 'PAID'    ? 'badge-success' :
                    rec.status === 'OVERDUE' ? 'badge-danger'  : 'badge-warning'
                  }`}>
                    {rec.status}
                  </span>
                  {rec.status === 'PAID' && rec.paidOn && new Date(rec.paidOn) < new Date(rec.dueDate) && (
                    <span className="badge badge-primary" style={{ marginLeft: '0.4rem' }}>Pre-paid</span>
                  )}
                </td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {rec.paidOn ? new Date(rec.paidOn).toLocaleDateString() : '—'}
                </td>
                <td>
                  {rec.status !== 'PAID' && (
                    <button
                      className="btn btn-success btn-sm"
                      disabled={saving === rec._id}
                      onClick={() => markPaid(rec._id)}
                    >
                      {saving === rec._id ? '…' : <><CheckCircle size={13} /> Mark Paid</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ── Main TenantProfile ──────────────────────────────────────────────────
const TenantProfile = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { t }    = useLang();

  const [tenant,   setTenant]   = useState(null);
  const [charges,  setCharges]  = useState({ charges: [], totalDue: 0 });
  const [rooms,    setRooms]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedChargeId,   setSelectedChargeId]   = useState(null);

  const fetchTenantData = useCallback(async () => {
    try {
      const [tenantRes, chargesRes] = await Promise.all([
        axiosInstance.get(`/tenants/${id}`),
        axiosInstance.get(`/tenants/${id}/charges`),
      ]);
      setTenant(tenantRes.data);
      setCharges(chargesRes.data);

      // Load rooms for this boarding place (for the edit modal room selector)
      if (tenantRes.data?.boardingPlace?._id) {
        axiosInstance.get(`/boarding-places/${tenantRes.data.boardingPlace._id}/rooms`)
          .then(r => setRooms(r.data))
          .catch(() => {});
      }
    } catch {
      toast.error('Failed to load tenant details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchTenantData(); }, [fetchTenantData]);

  const handleMoveOut = async () => {
    if (!window.confirm(t('moveOutConfirm'))) return;
    try {
      await axiosInstance.patch(`/tenants/${id}/move-out`);
      toast.success('Tenant successfully moved out.');
      setTenant(prev => ({ ...prev, status: 'MOVED_OUT' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process move out.');
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>;
  if (!tenant) return <p>{t('tenantNotFound')}</p>;

  const rentAmount = tenant.rentAmount || tenant.monthlyRent || 0;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm" style={{ marginBottom: '1.25rem' }}>
        <ArrowLeft size={14} /> {t('back')}
      </button>

      <div className="profile-grid">

        {/* ── Profile card ── */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#ca7df9,#724cf9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.4rem', flexShrink: 0 }}>
              {tenant.fullName.charAt(0).toUpperCase()}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tenant.fullName}</h2>
                <span className={`badge ${tenant.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                  {tenant.status}
                </span>
                {charges.totalDue > 0 && (
                  <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertTriangle size={11} /> Overdue
                  </span>
                )}
              </div>
              {charges.totalDue > 0 && (
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--danger)' }}>
                  Rs. {charges.totalDue.toLocaleString()} outstanding
                </p>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid-2">
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('personalInfoTitle')}
              </h4>
              {[
                ['NIC',     tenant.nicNumber],
                ['Email',   tenant.email],
                ['Contact', tenant.contactNumber],
                ['Address', tenant.address || '—'],
                ['Course',  tenant.courseOrWorkplace || '—'],
                ['Rent',    `Rs. ${rentAmount.toLocaleString()}`],
              ].map(([label, val]) => (
                <p key={label} style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                  <strong style={{ color: 'var(--text-muted)', marginRight: '0.3rem' }}>{label}:</strong>{val}
                </p>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('tenancyTitle')}
              </h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Room:</strong> {tenant.room?.roomNumber}
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Admitted:</strong> {new Date(tenant.admissionDate).toLocaleDateString()}
              </p>

              <h4 style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.4rem' }}>
                {t('emergencyTitle')}
              </h4>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.4rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Name:</strong> {tenant.emergencyContact?.name || '—'}
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Number:</strong> {tenant.emergencyContact?.number || '—'}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            {/* Edit button — always visible */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowEdit(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Edit2 size={14} /> {t('editTenant')}
            </button>

            {tenant.status === 'ACTIVE' && (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setSelectedChargeId(null); setIsPaymentModalOpen(true); }}
                >
                  <CreditCard size={14} /> {t('recordPayment')}
                </button>
                <button onClick={handleMoveOut} className="btn btn-danger btn-sm">
                  {t('moveOut')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Rent Records ── */}
        <RentRecordsTable
          tenantId={id}
          monthlyRent={rentAmount}
        />

        {/* ── Charge history ── */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Shared Bill Charges</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Outstanding</p>
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--danger)' }}>
                  Rs. {charges.totalDue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {charges.charges.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No shared-bill charges recorded yet.</p>
          ) : (
            <table className="bms-table">
              <thead>
                <tr>
                  <th>Date Due</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {charges.charges.map(charge => (
                  <tr key={charge._id}>
                    <td>{new Date(charge.dueDate).toLocaleDateString()}</td>
                    <td>{charge.type === 'RENT' ? 'Monthly Rent' : charge.costReference?.title || 'Shared Bill'}</td>
                    <td>
                      <span className={`badge ${
                        charge.status === 'PENDING'      ? 'badge-warning' :
                        charge.status === 'PAID'         ? 'badge-success' :
                        charge.status === 'UNDER_REVIEW' ? 'badge-info'    : 'badge-muted'
                      }`}>
                        {charge.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>Rs. {charge.amountDue.toLocaleString()}</td>
                    <td>
                      {charge.status === 'PENDING' && (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => { setSelectedChargeId(charge._id); setIsPaymentModalOpen(true); }}
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

        {/* ── Documents ── */}
        {(tenant.idFrontImageUrl || tenant.idBackImageUrl || tenant.signatureImageUrl) && (
          <div className="card">
            <h3 className="section-title">Documents</h3>
            <div className="doc-grid">
              {[
                { url: tenant.idFrontImageUrl,   label: 'ID Front' },
                { url: tenant.idBackImageUrl,    label: 'ID Back'  },
                { url: tenant.signatureImageUrl, label: 'Signature'},
              ].filter(d => d.url).map(doc => (
                <div key={doc.label} style={{ textAlign: 'center' }}>
                  <a href={doc.url} target="_blank" rel="noreferrer">
                    <img src={doc.url} alt={doc.label} style={{ width: '100%', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                  </a>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{doc.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showEdit && (
        <EditTenantModal
          tenant={tenant}
          rooms={rooms}
          onClose={() => setShowEdit(false)}
          onSaved={fetchTenantData}
          t={t}
        />
      )}

      {/* ── Record Payment Modal ── */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedChargeId(null); }}
        tenantId={id}
        chargeLineId={selectedChargeId}
        onSuccess={fetchTenantData}
      />
    </div>
  );
};

export default TenantProfile;