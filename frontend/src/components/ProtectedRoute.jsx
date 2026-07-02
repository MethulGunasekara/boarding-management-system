import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading session...</div>;
  }

  if (!user) {
    // Not logged in at all, redirect to login page
    return <Navigate to="/" replace />;
  }

  // If specific roles are required, check against the user's role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Correct user, wrong access level (e.g. Owner trying to access Admin pages)
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <h2>403 - Unauthorized Access</h2>
        <p>Your role ({user.role}) does not have permission to view this page.</p>
      </div>
    );
  }

  // If they pass all checks, render the protected component
  return children;
};

export default ProtectedRoute;

{/* In a React Single Page Application (SPA), routing happens entirely in the browser. 
    Without route guards, anyone could just type /admin/dashboard into the URL bar and 
    see the admin UI (even if the backend blocks the actual data). 
    A ProtectedRoute acts as a bouncer: it checks our AuthContext, verifies the user is 
    logged in and has the correct role, and kicks them out via a <Navigate> redirect if 
    they don't. 
*/}