import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { ChevronRight, AlertTriangle, CheckCircle, Users, Phone, Trash2 } from 'lucide-react';

// ── Confirm Delete Dialog ───────────────────────────────────────────────
const DeleteConfirmModal = ({ owner, onConfirm, onCancel, loading }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '1rem',
  }}>
    <div className="card" style={{ width: '100%', maxWidth: 440, padding: '1.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Trash2 size={20} color="var(--danger)" />
        </div>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.15rem' }}>Delete Owner Account</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This action cannot be undone.</p>
        </div>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          You are about to permanently delete <strong>{owner.fullName}</strong> ({owner.email}).
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This will erase:</p>
        <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '1.25rem', marginTop: '0.3rem', lineHeight: 1.8 }}>
          <li>All boarding places, rooms, and costs</li>
          <li>All tenant records, charges, payments, and deposits</li>
          <li>All Cloudinary files (ID photos, signatures)</li>
          <li>All subscription payment records</li>
          <li>The owner account itself</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }} disabled={loading}>
          Cancel
        </button>
        <button onClick={onConfirm} className="btn btn-danger" style={{ flex: 1 }} disabled={loading}>
          {loading ? 'Deleting…' : 'Yes, Delete Everything'}
        </button>
      </div>
    </div>
  </div>
);

// ── Owner Detail Panel ──────────────────────────────────────────────────
const OwnerDetail = ({ ownerId, plans, onClose, onRefresh }) => {
  const { t }     = useLang();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(null);

  const load = () => {
    setLoading(true);
    axiosInstance.get(`/admin/owners/${ownerId}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load owner details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [ownerId]);

  const markPaid = async (subId) => {
    setSaving(subId);
    try {
      await axiosInstance.patch(`/admin/owner-subscriptions/${subId}/pay`);
      toast.success('Marked as paid. Next month record generated.');
      load(); onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(null); }
  };

  const changePlan = async (planId) => {
    try {
      await axiosInstance.patch(`/admin/owners/${ownerId}/plan`, { planId });
      toast.success(t('planUpdated'));
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const changeStatus = async (status) => {
    try {
      await axiosInstance.patch(`/admin/owners/${ownerId}/status`, { status });
      toast.success(t('statusUpdated'));
      load(); onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      {t('loading')}
    </div>
  );
  if (!data) return null;

  const { owner, subscriptions } = data;
  const isOverdue =
    owner.nextPaymentDue &&
    new Date() > new Date(owner.nextPaymentDue) &&
    owner.ownerSubscriptionStatus !== 'INACTIVE';

  return (
    <div style={{
      border: '2px solid var(--primary)',
      borderRadius: 'var(--radius)',
      background: 'var(--bg-card)',
      padding: '1.5rem',
      marginTop: '0.5rem',
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 800 }}>{owner.fullName}</h3>
            <span className={`badge ${
              owner.ownerSubscriptionStatus === 'ACTIVE'  ? 'badge-success' :
              owner.ownerSubscriptionStatus === 'OVERDUE' ? 'badge-danger'  : 'badge-muted'
            }`}>
              {owner.ownerSubscriptionStatus}
            </span>
            {isOverdue && (
              <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertTriangle size={10} /> {t('paymentOverdue')}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>{owner.email}</p>
          {owner.phoneNumber && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Phone size={12} /> {owner.phoneNumber}
            </p>
          )}
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.1rem' }}>
            {t('plan')}: <strong>{owner.plan?.name || t('noPlanAssigned')}</strong>
            {' · '}
            {t('nextPayment')}: <strong>{owner.nextPaymentDue ? new Date(owner.nextPaymentDue).toLocaleDateString() : '—'}</strong>
          </p>
        </div>
        <button onClick={onClose} className="btn btn-outline btn-sm">{t('cancel')}</button>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <label className="form-label">{t('changePlan')}</label>
          <select className="form-input" style={{ width: 'auto' }} value={owner.plan?._id || ''} onChange={e => changePlan(e.target.value)}>
            <option value="" disabled>-- {t('plan')} --</option>
            {plans.map(p => <option key={p._id} value={p._id}>{p.name} (Rs. {p.price}/mo)</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">{t('accountStatus')}</label>
          <select className="form-input" style={{ width: 'auto' }} value={owner.ownerSubscriptionStatus} onChange={e => changeStatus(e.target.value)}>
            <option value="ACTIVE">{t('activeStatus')}</option>
            <option value="OVERDUE">{t('overdueStatus')}</option>
            <option value="INACTIVE">{t('inactiveStatus')}</option>
          </select>
        </div>
      </div>

      {/* Subscription history */}
      <h4 style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
        {t('monthlyHistory')}
      </h4>

      {subscriptions.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('noSubRecords')}</p>
      ) : (
        <table className="bms-table">
          <thead>
            <tr>
              <th>{t('monthCol')}</th>
              <th>{t('dueDateCol')}</th>
              <th>{t('amountCol')}</th>
              <th>{t('statusCol')}</th>
              <th>{t('paidOnCol')}</th>
              <th>{t('actionCol')}</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(sub => (
              <tr key={sub._id}>
                <td style={{ fontWeight: 600 }}>{sub.monthName}</td>
                <td>{new Date(sub.dueDate).toLocaleDateString()}</td>
                <td>Rs. {sub.amountDue.toLocaleString()}</td>
                <td>
                  <span className={`badge ${
                    sub.status === 'PAID'    ? 'badge-success' :
                    sub.status === 'OVERDUE' ? 'badge-danger'  : 'badge-warning'
                  }`}>{sub.status}</span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {sub.paidOn ? new Date(sub.paidOn).toLocaleDateString() : '—'}
                </td>
                <td>
                  {sub.status !== 'PAID' && (
                    <button className="btn btn-success btn-sm" disabled={saving === sub._id} onClick={() => markPaid(sub._id)}>
                      {saving === sub._id ? '…' : <><CheckCircle size={13} /> {t('markPaid')}</>}
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

// ── Main page ────────────────────────────────────────────────────────────
const OwnerProfiles = () => {
  const { t }      = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const [owners,   setOwners]   = useState([]);
  const [plans,    setPlans]    = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Delete dialog state
  const [deleteTarget,  setDeleteTarget]  = useState(null); // owner object
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadOwners = () => {
    axiosInstance.get('/admin/owners')
      .then(r => setOwners(r.data))
      .catch(() => toast.error('Failed to load owners'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOwners();
    axiosInstance.get('/plans/all').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  // Auto-expand row from notification ?open= param
  useEffect(() => {
    const openId = searchParams.get('open');
    if (openId && owners.length > 0) {
      const exists = owners.find(o => o._id === openId);
      if (exists) {
        setExpanded(openId);
        setSearchParams({}, { replace: true });
        setTimeout(() => {
          const el = document.getElementById(`owner-row-${openId}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      }
    }
  }, [owners, searchParams]);

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(`/admin/owners/${deleteTarget._id}`);
      toast.success(res.data.message);
      setDeleteTarget(null);
      setExpanded(null);
      loadOwners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.');
    } finally { setDeleteLoading(false); }
  };

  const activeCount  = owners.filter(o => o.ownerSubscriptionStatus === 'ACTIVE').length;
  const overdueCount = owners.filter(o => o.isPaymentOverdue).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('ownerAccounts')}</h1>
        <p className="page-sub">{t('ownerAccountsDesc')}</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Users size={20} /></div>
          <div><div className="stat-value">{owners.length}</div><div className="stat-label">{t('totalOwners')}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><CheckCircle size={20} /></div>
          <div><div className="stat-value">{activeCount}</div><div className="stat-label">{t('active')}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-danger"><AlertTriangle size={20} /></div>
          <div><div className="stat-value" style={{ color: 'var(--danger)' }}>{overdueCount}</div><div className="stat-label">{t('paymentOverdue')}</div></div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('loading')}</p>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="bms-table">
            <thead>
              <tr>
                <th>{t('owner')}</th>
                <th>{t('phone')}</th>
                <th>{t('plan')}</th>
                <th>{t('status')}</th>
                <th>{t('nextPayment')}</th>
                <th>{t('payment')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {owners.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {t('noOwnersYet')}
                  </td>
                </tr>
              ) : owners.map(owner => (
                <>
                  <tr
                    key={owner._id}
                    id={`owner-row-${owner._id}`}
                    style={{
                      background: expanded === owner._id ? 'var(--bg-surface)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                  >
                    {/* Clicking the name/cells expands; delete button stops propagation */}
                    <td style={{ cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      <p style={{ fontWeight: 600 }}>{owner.fullName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{owner.email}</p>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      {owner.phoneNumber || <span style={{ color: 'var(--border-color)' }}>—</span>}
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      {owner.plan?.name || <span style={{ color: 'var(--text-muted)' }}>{t('noPlanAssigned')}</span>}
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      <span className={`badge ${
                        owner.ownerSubscriptionStatus === 'ACTIVE'  ? 'badge-success' :
                        owner.ownerSubscriptionStatus === 'OVERDUE' ? 'badge-danger'  : 'badge-muted'
                      }`}>
                        {owner.ownerSubscriptionStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.875rem', cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      {owner.nextPaymentDue ? new Date(owner.nextPaymentDue).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ cursor: 'pointer' }} onClick={() => toggle(owner._id)}>
                      {owner.isPaymentOverdue ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                          <AlertTriangle size={10} /> {t('overdue')}
                        </span>
                      ) : (
                        <span className="badge badge-success">{t('onTime')}</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <ChevronRight
                          size={16}
                          onClick={() => toggle(owner._id)}
                          style={{
                            color: 'var(--text-muted)', cursor: 'pointer',
                            transform: expanded === owner._id ? 'rotate(90deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        />
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                          title="Delete owner and all data"
                          onClick={e => { e.stopPropagation(); setDeleteTarget(owner); }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded === owner._id && (
                    <tr key={`${owner._id}-detail`}>
                      <td colSpan={7} style={{ padding: '0 1rem 1rem', background: 'var(--bg-surface)' }}>
                        <OwnerDetail
                          ownerId={owner._id}
                          plans={plans}
                          onClose={() => setExpanded(null)}
                          onRefresh={loadOwners}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          owner={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default OwnerProfiles;