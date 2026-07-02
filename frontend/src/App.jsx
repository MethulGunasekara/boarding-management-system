import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components & Pages
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddProperty from './pages/AdminAddProperty';

import OwnerDashboard from './pages/OwnerDashboard';
import OwnerAddProperty from './pages/OwnerAddProperty';
import OwnerPropertyDetails from './pages/OwnerPropertyDetails';
import TenantList from './pages/TenantList';
import OwnerAdmitTenant from './pages/OwnerAdmitTenant';
import TenantProfile from './pages/TenantProfile';
import CostDashboard from './pages/CostDashboard';

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
              border: '1px solid var(--border-color)'
            }
          }}
        />

        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Login />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/admin/add-property" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAddProperty />
              </ProtectedRoute>
            } 
          />
          {/* Protected Owner Routes */}
            <Route path="/owner/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/owner/add-property" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerAddProperty />
              </ProtectedRoute>
            } 
          />
          <Route path="/owner/property/:id" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerPropertyDetails />
              </ProtectedRoute>
            } 
          />
          <Route path="/owner/property/:id/tenants" 
          element={
            <ProtectedRoute allowedRoles={['OWNER']}>
                <TenantList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/owner/property/:id/admit-tenant" 
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerAdmitTenant />
              </ProtectedRoute>
            } 
          />
          <Route path="/owner/tenant/:id" element={<TenantProfile />} />
          <Route path="/owner/property/:id/costs" element={<CostDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;