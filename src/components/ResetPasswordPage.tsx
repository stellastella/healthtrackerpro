import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Home, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const { isDark } = useTheme();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Preparing to reset your password...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });

  useEffect(() => {
    // Check if we have a valid hash in the URL
    const hash = window.location.hash;
    if (!hash) {
      setStatus('error');
      setMessage('Invalid password reset link. Please request a new password reset link.');
      return;
    }

    // If we have a hash, we're ready to reset the password
    setStatus('ready');
    setMessage('Please enter your new password below.');
  }, []);

  // Validate password as user types
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  }, [password]);

  const isPasswordValid = () => {
    return passwordValidation.length && 
           passwordValidation.uppercase && 
           passwordValidation.lowercase && 
           passwordValidation.number;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.');
      return;
    }

    if (!isPasswordValid()) {
      setMessage('Password must meet all the requirements shown below.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Error resetting password:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to reset password. Please try again.');
      } else {
        setStatus('success');
        setMessage('Your password has been successfully reset! You can now sign in with your new password.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Loading
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please wait while we prepare to reset your password...
            </p>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-blue-900/30' : 'bg-blue-100'
            }`}>
              <Lock className={`h-10 w-10 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Reset Your Password
            </h2>
            <p className={`mb-6 text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Please enter a new password for your account.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              {message && message !== 'Please enter your new password below.' && (
                <div className={`p-4 rounded-lg ${
                  status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                }`}>
                  {message}
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Requirements */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Password must meet all of the following requirements:
                  </p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center space-x-1 ${
                      passwordValidation.length ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.length ? 'opacity-100' : 'opacity-50'}`} />
                      <span>At least 8 characters long</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${
                      passwordValidation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.uppercase ? 'opacity-100' : 'opacity-50'}`} />
                      <span>At least one uppercase letter (A-Z)</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${
                      passwordValidation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.lowercase ? 'opacity-100' : 'opacity-50'}`} />
                      <span>At least one lowercase letter (a-z)</span>
                    </li>
                    <li className={`flex items-center space-x-1 ${
                      passwordValidation.number ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <CheckCircle className={`h-3 w-3 ${passwordValidation.number ? 'opacity-100' : 'opacity-50'}`} />
                      <span>At least one number (0-9)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid()}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Resetting Password...</span>
                  </div>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-green-900/30' : 'bg-green-100'
            }`}>
              <CheckCircle className={`h-10 w-10 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Password Reset Successful!
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
              <AlertTriangle className={`h-10 w-10 ${
                isDark ? 'text-red-400' : 'text-red-600'
              }`} />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Password Reset Failed
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
                href="/?reset=true"
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

export default ResetPasswordPage;