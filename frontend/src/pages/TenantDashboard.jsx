import { Home } from 'lucide-react';

const TenantDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-500 text-sm">Find a boarding place and manage your rental.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center mt-8">
        <Home className="h-16 w-16 text-green-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Welcome to the Platform!</h3>
        <p className="mt-1 text-gray-500 max-w-md">
          You don't have an active boarding place yet. Soon, you'll be able to search and request to join a property!
        </p>
      </div>
    </div>
  );
};

export default TenantDashboard;