import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/auth/authSlice';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Building,
  CreditCard
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/');
  };

  // Define links based on roles
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Boarding Places', path: '/admin/places', icon: Building },
    { name: 'Overdue Accounts', path: '/admin/overdue', icon: Users },
  ];

  const ownerLinks = [
    { name: 'My Property', path: '/owner', icon: Building },
    { name: 'Tenants', path: '/owner/tenants', icon: Users },
    { name: 'Financials', path: '/owner/financials', icon: FileText },
  ];

  const tenantLinks = [
    { name: 'My Portal', path: '/portal', icon: Home },
    { name: 'My Bills', path: '/portal/bills', icon: CreditCard },
  ];

  // Determine which links to show
  let linksToRender = [];
  if (user?.role === 'ADMIN') linksToRender = adminLinks;
  else if (user?.role === 'OWNER') linksToRender = ownerLinks;
  else if (user?.role === 'TENANT') linksToRender = tenantLinks;

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen text-white transition-all duration-300">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Building className="text-blue-500" /> BMS Portal
        </h1>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto mt-4">
        <nav className="flex-1 px-2 space-y-2">
          {linksToRender.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout at the bottom */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4 px-2 text-sm text-gray-400">
          <div className="truncate">
            <p className="font-semibold text-gray-200">{user?.fullName || 'User'}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;