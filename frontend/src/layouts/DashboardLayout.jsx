import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);

  // Security Check: If someone tries to manually type /admin in the URL bar 
  // without being logged in, redirect them immediately to the login page.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* The Navigation Sidebar */}
      <Sidebar />
      
      {/* The Dynamic Content Area */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm h-20 flex items-center px-8 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Welcome back, {user?.role === 'TENANT' ? user.fullName : user.email}!
          </h2>
        </header>
        
        {/* <Outlet /> is where the actual page content (like Admin Dashboard) will be injected */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;