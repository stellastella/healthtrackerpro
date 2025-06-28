import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import AuthConfirmationPage from './components/AuthConfirmationPage.tsx';
import ResetPasswordPage from './components/ResetPasswordPage.tsx';
import './i18n'; // Initialize i18n
import './index.css';

// Apply theme from localStorage immediately to prevent flash
const applyStoredTheme = () => {
  const theme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (theme === 'dark' || (!theme && prefersDark)) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
  }
};

// Apply theme immediately
applyStoredTheme();

// Create a non-blocking render function
const renderApp = () => {
  const root = document.getElementById('root');
  if (!root) return;

  // Check if this is an auth route
  const isAuthConfirmation = window.location.pathname.startsWith('/auth/confirm');
  const isResetPassword = window.location.pathname.startsWith('/auth/reset-password');

  const AppWithProviders = () => (
    <ThemeProvider>
      <AuthProvider>
        {isAuthConfirmation ? <AuthConfirmationPage /> : 
         isResetPassword ? <ResetPasswordPage /> : 
         <App />}
      </AuthProvider>
    </ThemeProvider>
  );

  createRoot(root).render(<AppWithProviders />);
};

// Check if the document is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  // Use requestIdleCallback or setTimeout to defer non-critical initialization
  if (window.requestIdleCallback) {
    window.requestIdleCallback(renderApp);
  } else {
    setTimeout(renderApp, 1);
  }
}