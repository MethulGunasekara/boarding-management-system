import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { LangProvider }  from './context/LangContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const googleConfigured =
  !!GOOGLE_CLIENT_ID &&
  GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
  GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com');

const renderApp = async () => {
  let Wrapper = ({ children }) => children;

  if (googleConfigured) {
    try {
      const { GoogleOAuthProvider } = await import('@react-oauth/google');
      Wrapper = ({ children }) => (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      );
    } catch {
      // Package not installed — silently skip
    }
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Wrapper>
        <ThemeProvider>
          <LangProvider>
            <App />
          </LangProvider>
        </ThemeProvider>
      </Wrapper>
    </React.StrictMode>
  );
};

renderApp();