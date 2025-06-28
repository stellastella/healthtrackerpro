import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Home, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const AuthConfirmationPage: React.FC = () => {
  const { isDark } = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = window.location.hash;
        
        // If there's no hash, check for query parameters (for email confirmation)
        if (!hash) {
          const queryParams = new URLSearchParams(window.location.search);
          const token_hash = queryParams.get('token_hash');
          const type = queryParams.get('type');
          
          if (token_hash && type === 'email_confirmation') {
            // This is an email confirmation
            setStatus('success');
            setMessage('Your email has been successfully verified! You can now sign in to your account.');
            return;
          }
        }
        
        // If we reach here, we couldn't verify the email
        setStatus('error');
        setMessage('We couldn\'t verify your email. The link may have expired or is invalid.');
      } catch (error) {
        console.error('Error during email confirmation:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again or contact support.');
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
      <div className={`max-w-md w-full p-8 rounded-2xl shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Verifying Your Email
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please wait while we confirm your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`h-12 w-12 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Email Verified!
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/"
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Go to Home</span>
              </a>
              <a 
                href="/?signin=true"
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <LogIn className="h-5 w-5" />
                <span>Sign In</span>
              </a>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-red-900/30' : 'bg-red-100'
            }`}>
              <AlertTriangle className={`h-12 w-12 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Verification Failed
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/"
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <Home className="h-5 w-5" />
                <span>Go to Home</span>
              </a>
              <a 
                href="/?signup=true"
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <LogIn className="h-5 w-5" />
                <span>Try Again</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthConfirmationPage;