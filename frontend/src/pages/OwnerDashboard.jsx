import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Building, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const [myPlaces, setMyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPlaces = async () => {
      try {
        const response = await api.get('/boarding-places/my-places');
        setMyPlaces(response.data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPlaces();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
          <p className="text-gray-500 text-sm">Manage your boarding places and tenant requests.</p>
        </div>
            <Link to="/owner/add-property" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Property
            </Link>
        </div>

      {myPlaces.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
          <Building className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No properties yet</h3>
          <p className="mt-1 text-gray-500 max-w-sm">You haven't added any boarding places to your portfolio. Click the button above to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPlaces.map((place) => (
            <div key={place._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{place.address}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-sm font-medium text-gray-700">Capacity: {place.capacity || 0} tenants</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;