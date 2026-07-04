import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import TenantLogin from './pages/TenantLogin';

import AdminDashboard from './pages/AdminDashboard';
import AdminAddProperty from './pages/AdminAddProperty';

import OwnerDashboard from './pages/OwnerDashboard';
import OwnerAddProperty from './pages/OwnerAddProperty';
import OwnerPropertyDetails from './pages/OwnerPropertyDetails';
import TenantList from './pages/TenantList';
import OwnerAdmitTenant from './pages/OwnerAdmitTenant';
import TenantProfile from './pages/TenantProfile';
import CostDashboard from './pages/CostDashboard';
import PaymentApprovals from './pages/PaymentApprovals';
import TenantDashboard from './pages/TenantDashboard';

// Helper: combines ProtectedRoute + DashboardLayout in one wrapper
const PL = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
            },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />
          <Route path="/tenant/login" element={<TenantLogin />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<PL roles={['ADMIN']}><AdminDashboard /></PL>} />
          <Route path="/admin/add-property" element={<PL roles={['ADMIN']}><AdminAddProperty /></PL>} />

          {/* Owner */}
          <Route path="/owner/dashboard"  element={<PL roles={['OWNER']}><OwnerDashboard /></PL>} />
          <Route path="/owner/add-property" element={<PL roles={['OWNER']}><OwnerAddProperty /></PL>} />
          <Route path="/owner/property/:id" element={<PL roles={['OWNER']}><OwnerPropertyDetails /></PL>} />
          <Route path="/owner/property/:id/tenants" element={<PL roles={['OWNER']}><TenantList /></PL>} />
          <Route path="/owner/property/:id/admit-tenant" element={<PL roles={['OWNER']}><OwnerAdmitTenant /></PL>} />
          <Route path="/owner/tenant/:id" element={<PL roles={['OWNER']}><TenantProfile /></PL>} />
          <Route path="/owner/property/:id/costs" element={<PL roles={['OWNER']}><CostDashboard /></PL>} />
          <Route path="/owner/approvals" element={<PL roles={['OWNER']}><PaymentApprovals /></PL>} />

          {/* Tenant */}
          <Route path="/tenant/dashboard" element={<PL roles={['TENANT']}><TenantDashboard /></PL>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;