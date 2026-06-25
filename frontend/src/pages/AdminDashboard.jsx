import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, Building, ShieldCheck, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalTenants: 0,
    totalPlaces: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We use an async function inside useEffect to fetch data
    const fetchAdminData = async () => {
      try {
        // Run both API calls at the same time for maximum performance
        const [usersRes, placesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/boarding-places')
        ]);

        const users = usersRes.data;
        const places = placesRes.data;

        // Calculate our statistics
        const owners = users.filter(u => u.role === 'OWNER').length;
        const admins = users.filter(u => u.role === 'ADMIN').length;
        // In a real app, we'd fetch actual tenants. For now, we'll simulate it or pull from users.
        const tenants = users.filter(u => u.role === 'TENANT').length;

        setStats({
          totalUsers: users.length,
          totalOwners: owners,
          totalAdmins: admins,
          totalTenants: tenants,
          totalPlaces: places.length,
        });
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm">Real-time statistics for your boarding management system.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Accounts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Property Owners</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOwners}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
            <Building size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Boarding Places</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPlaces}</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Platform Admins</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
          </div>
        </div>

      </div>

      {/* Placeholder for future charts or tables */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <Activity size={48} className="mb-4 text-gray-300" />
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;