import { useState, useEffect } from 'react';
import { useLang } from '../../context/LangContext';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, CheckCircle } from 'lucide-react';

const emptyForm = { name: '', price: '', maxBoardingPlaces: 1, maxRoomsPerPlace: 10, features: [''], isActive: true };

const PlanManager = () => {
  const { t }    = useLang();
  const [plans,  setPlans]  = useState([]);
  const [modal,  setModal]  = useState(null); // null | 'create' | plan object (edit)
  const [form,   setForm]   = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => axiosInstance.get('/plans/all').then(r => setPlans(r.data)).catch(() => toast.error('Failed to load plans'));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setModal('create'); };
  const openEdit   = plan => { setForm({ ...plan, features: plan.features?.length ? plan.features : [''] }); setModal(plan); };
  const closeModal = () => setModal(null);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price), maxBoardingPlaces: Number(form.maxBoardingPlaces), maxRoomsPerPlace: Number(form.maxRoomsPerPlace), features: form.features.filter(f => f.trim()) };
    try {
      if (modal === 'create') {
        await axiosInstance.post('/plans', payload);
        toast.success('Plan created!');
      } else {
        await axiosInstance.put(`/plans/${modal._id}`, payload);
        toast.success('Plan updated!');
      }
      load(); closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this plan?')) return;
    try { await axiosInstance.delete(`/plans/${id}`); toast.success('Plan deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  const setFeature = (i, val) => {
    const f = [...form.features]; f[i] = val; setForm({ ...form, features: f });
  };
  const addFeature    = () => setForm({ ...form, features: [...form.features, ''] });
  const removeFeature = i  => setForm({ ...form, features: form.features.filter((_, fi) => fi !== i) });

  return (
    <div>
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Subscription Plans</h1>
          <p className="page-sub">Create and manage the plans boarding owners sign up for</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16} /> New Plan</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {plans.map(plan => (
          <div key={plan._id} className="card" style={{ opacity: plan.isActive ? 1 : 0.55 }}>
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontWeight: 800 }}>{plan.name}</h3>
              <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-muted'}`}>{plan.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem' }}>Rs. {plan.price.toLocaleString()}<span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span></p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {plan.maxBoardingPlaces} property · {plan.maxRoomsPerPlace} rooms/place
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {(plan.features || []).map((f, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.4rem', fontSize: '0.8rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> {f}
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(plan)}><Edit2 size={13} /> Edit</button>
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(plan._id)}><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        {plans.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No plans yet. Create one above.</p>}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem', overflowY: 'auto' }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontWeight: 800 }}>{modal === 'create' ? 'Create New Plan' : `Edit: ${modal.name}`}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              {[
                { key: 'name',               label: 'Plan Name',                    type: 'text',   ph: 'e.g., Starter' },
                { key: 'price',              label: 'Monthly Price (Rs.)',           type: 'number', ph: '1500' },
                { key: 'maxBoardingPlaces',  label: 'Max Boarding Places',          type: 'number', ph: '1' },
                { key: 'maxRoomsPerPlace',   label: 'Max Rooms per Boarding Place', type: 'number', ph: '10' },
              ].map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input type={f.type} className="form-input" placeholder={f.ph} min={f.type === 'number' ? 1 : undefined}
                    value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
                </div>
              ))}

              {/* Features list */}
              <div className="form-group">
                <label className="form-label">Features (bullet list shown on landing page)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {form.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.4rem' }}>
                      <input type="text" className="form-input" placeholder="e.g., Digital tenant admission"
                        value={feat} onChange={e => setFeature(i, e.target.value)} />
                      {form.features.length > 1 && (
                        <button type="button" onClick={() => removeFeature(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><X size={16} /></button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addFeature} className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}>
                    <Plus size={13} /> Add Feature
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input type="checkbox" id="isActive" checked={form.isActive}
                  onChange={e => setForm({ ...form, isActive: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: 'var(--primary)' }} />
                <label htmlFor="isActive" style={{ fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>Active (visible to public)</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? 'Saving…' : modal === 'create' ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManager;