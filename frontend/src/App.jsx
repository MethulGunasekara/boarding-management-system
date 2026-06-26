import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminBoardingPlaces from './pages/AdminBoardingPlaces';
import Register from './pages/Register';
import OwnerDashboard from './pages/OwnerDashboard';
import CreateProperty from './pages/CreateProperty';
import TenantDashboard from './pages/TenantDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes Wrapper */}
          <Route element={<DashboardLayout />}>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/places" element={<AdminBoardingPlaces />} />
            <Route path="/admin/overdue" element={<div>Overdue Accounts</div>} />
          
            {/* Owner Routes */}
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/owner/add-property" element={<CreateProperty />} /> 
            <Route path="/owner/tenants" element={<div>Manage Tenants</div>} />
            <Route path="/owner/financials" element={<div>Financials & Utilities</div>} />

            {/* Tenant Routes */}
              <Route path="/tenant" element={<TenantDashboard />} />
              <Route path="/portal/bills" element={<div>My Bills</div>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;