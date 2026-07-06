import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import {
  LayoutDashboard, Building2, PlusCircle, CheckSquare,
  DoorOpen, LogOut, FileText, CreditCard, Users,
} from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);
  const { t }    = useLang();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const adminLinks = [
    { to: '/admin/dashboard',   icon: LayoutDashboard, label: t('dashboard') },
    { to: '/admin/add-property', icon: PlusCircle,     label: t('addProperty') },
    { to: '/admin/plans',        icon: CreditCard,     label: 'Subscription Plans' },
    { to: '/admin/owners',       icon: Users,          label: 'Owner Accounts' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard',    icon: LayoutDashboard, label: t('dashboard') },
    { to: '/owner/approvals',    icon: CheckSquare,     label: t('paymentApprovals') },
    { to: '/owner/add-property', icon: PlusCircle,      label: t('addProperty') },
  ];

  const tenantLinks = [
    { to: '/tenant/dashboard', icon: FileText, label: t('myBills') },
  ];

  const links =
    user?.role === 'ADMIN'  ? adminLinks  :
    user?.role === 'OWNER'  ? ownerLinks  :
    user?.role === 'TENANT' ? tenantLinks : [];

  return (
    <aside className="bms-sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><DoorOpen size={20} /></div>
        <div>
          <span className="sidebar-logo-text">BMS</span>
          <span className="sidebar-logo-sub">Management System</span>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {(user?.email || user?.fullName || '?').charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.fullName || user?.email}</p>
          <span className="sidebar-user-role">{user?.role}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut size={17} /> {t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;