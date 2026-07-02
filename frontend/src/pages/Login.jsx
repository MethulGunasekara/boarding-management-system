import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { AlignCenter } from 'lucide-react';

const Login = () => {
  const [loginType, setLoginType] = useState('OWNER'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Bring in our global state and routing hooks
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // The new async submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set the correct endpoint based on the selected role tab
    const endpoint = loginType === 'ADMIN' ? '/auth/login' : '/auth/owner/login';

    try {
      const response = await axiosInstance.post(endpoint, { email, password });
      
      // Save to context/localStorage
      login(response.data);
      toast.success(`Welcome back, ${response.data.role}!`);
      
      // Route based on role
      if (response.data.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/owner/dashboard');
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    }
  };


  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--primary)' }}>BMS Portal</h2>
        
        {/* Role Toggle Buttons */}
        <div className="flex-between" style={{ marginBottom: '1.5rem', gap: '0.5rem' }}>
          <button 
            type="button"
            className={`btn ${loginType === 'OWNER' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setLoginType('OWNER')}
          >
            Boarding Owner
          </button>
          <button 
            type="button"
            className={`btn ${loginType === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`}
            style={{ flex: 1 }}
            onClick={() => setLoginType('ADMIN')}
          >
            System Admin
          </button>
        </div>

        {/* The form structure (logic to be attached next) */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Sign In as {loginType === 'OWNER' ? 'Owner' : 'Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;