import { useState, useEffect, } from 'react';
import { useNavigate, Link} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, reset } from '../features/auth/authSlice';
import { LogIn, User, Key, Building } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'TENANT', // Default to the most common user type
  });

  const { email, password, role } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Grab the global auth state from Redux
  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError) {
      alert(message); // For now, we use a simple alert. In a real app, use a Toast notification!
    }

    // If login is successful, redirect based on their role
    if (isSuccess || user) {
      if (user?.role === 'ADMIN') navigate('/admin');
      else if (user?.role === 'OWNER') navigate('/owner');
      else navigate('/portal');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // Determine the correct backend endpoint based on the selected role
    let roleEndpoint = '';
    if (role === 'TENANT') roleEndpoint = '/auth/tenant/login';
    else if (role === 'OWNER') roleEndpoint = '/auth/owner/login';
    else if (role === 'ADMIN') roleEndpoint = '/auth/login';

    const userData = { email, password, roleEndpoint };
    dispatch(login(userData));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600">
          <Building size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Boarding Management
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to your account<br></br>
          admin@platform.com
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a...</label>
              <select
                name="role"
                value={role}
                onChange={onChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
              >
                <option value="TENANT">Tenant</option>
                <option value="OWNER">Property Owner</option>
                <option value="ADMIN">Platform Admin</option>
              </select>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={onChange}
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={onChange}
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" /> Sign in
                  </>
                )}
              </button>
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-600">Are you a property owner? </span>
                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Register your property</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;