import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, Heart, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Info, HelpCircle, Calendar, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  adminAccessRequested?: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin',
  adminAccessRequested = false 
}) => {
  const { isDark } = useTheme();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset' | 'confirmation'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  const { signIn, signUp, resetPassword, user, isAdmin } = useAuth();

  // Close modal and redirect to admin if user signs in successfully and admin access was requested
  useEffect(() => {
    if (user && adminAccessRequested && isAdmin) {
      onClose();
      // The parent component will handle the redirect to admin
    } else if (user && adminAccessRequested && !isAdmin) {
      setMessage({ 
        type: 'error', 
        text: 'You do not have admin privileges. Please contact the administrator for access.' 
      });
    }
  }, [user, adminAccessRequested, isAdmin, onClose]);

  // Pre-fill admin credentials if admin access is requested
  useEffect(() => {
    if (adminAccessRequested && mode === 'signin') {
      setEmail('angel@email.com');
      setPassword('angel1234');
    }
  }, [adminAccessRequested, mode]);

  // Validate password as user types
  useEffect(() => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    });
  }, [password]);

  if (!isOpen) return null;

  const getErrorMessage = (error: any): string => {
    if (error?.message?.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (error?.message?.includes('User not found')) {
      return 'No account found with this email address. Please sign up first.';
    }
    if (error?.message?.includes('Password should be at least')) {
      return 'Password must meet all the requirements shown below.';
    }
    if (error?.message?.includes('Unable to validate email address')) {
      return 'Please enter a valid email address.';
    }
    if (error?.message?.includes('User already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const isPasswordValid = () => {
    return passwordValidation.length && 
           passwordValidation.uppercase && 
           passwordValidation.lowercase && 
           passwordValidation.number;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setShowTroubleshooting(false);

    // Validate password for signup
    if (mode === 'signup' && !isPasswordValid()) {
      setMessage({ 
        type: 'error', 
        text: 'Password must meet all the requirements shown below.' 
      });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          const errorMessage = getErrorMessage(error);
          setMessage({ type: 'error', text: errorMessage });
          
          // Show troubleshooting for invalid credentials
          if (error.message?.includes('Invalid login credentials')) {
            setShowTroubleshooting(true);
            setTimeout(() => {
              setMessage({ 
                type: 'info', 
                text: 'Having trouble? Check the troubleshooting tips below or try resetting your password.' 
              });
            }, 3000);
          }
        } else {
          setMessage({ type: 'success', text: 'Successfully signed in!' });
          if (!adminAccessRequested) {
            setTimeout(() => onClose(), 1000);
          }
        }
      } else if (mode === 'signup') {
        // Prepare profile data
        const profileData = {
          full_name: fullName,
          date_of_birth: dateOfBirth || null,
          emergency_contact: emergencyContact || null,
          doctor_name: doctorName || null,
          doctor_phone: doctorPhone || null,
          medical_conditions: medicalConditions || null
        };

        const { error, emailConfirmationSent } = await signUp(email, password, fullName, profileData);
        if (error) {
          const errorMessage = getErrorMessage(error);
          setMessage({ type: 'error', text: errorMessage });
          
          // Auto-switch to sign-in mode if user already exists
          if (error.message?.includes('User already registered')) {
            setTimeout(() => {
              setMode('signin');
              setMessage({ 
                type: 'info', 
                text: 'Switched to sign-in mode. Please enter your password to continue.' 
              });
              setFullName(''); // Clear full name since we're switching to sign-in
              setDateOfBirth('');
              setEmergencyContact('');
              setDoctorName('');
              setDoctorPhone('');
              setMedicalConditions('');
            }, 2000);
          }
        } else if (emailConfirmationSent) {
          setMode('confirmation');
          setMessage({ 
            type: 'success', 
            text: 'Verification email sent! Please check your inbox and click the confirmation link to activate your account.' 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Account created successfully! You can now access all features.' 
          });
          setTimeout(() => {
            if (!adminAccessRequested) {
              setMode('signin');
              setMessage(null);
            }
          }, 2000);
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          setMessage({ type: 'error', text: getErrorMessage(error) });
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Password reset email sent! Please check your inbox and follow the instructions.' 
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again.' });
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setDateOfBirth('');
    setEmergencyContact('');
    setDoctorName('');
    setDoctorPhone('');
    setMedicalConditions('');
    setMessage(null);
    setShowPassword(false);
    setShowTroubleshooting(false);
    setShowAdvancedFields(false);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'reset' | 'confirmation') => {
    setMode(newMode);
    resetForm();
    
    // Pre-fill admin credentials if admin access is requested and switching to signin
    if (adminAccessRequested && newMode === 'signin') {
      setEmail('angel@email.com');
      setPassword('angel1234');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              adminAccessRequested 
                ? 'bg-blue-100 dark:bg-blue-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              {adminAccessRequested ? (
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              ) : (
                <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {adminAccessRequested && 'Admin Access - '}
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'reset' && 'Reset Password'}
                {mode === 'confirmation' && 'Email Verification'}
              </h2>
              {adminAccessRequested && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Authentication required for admin features
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Admin Access Notice */}
          {adminAccessRequested && (
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                <Shield className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Admin Dashboard Access</p>
                  <p className="text-sm">
                    Sign in with admin credentials to access the admin dashboard and manage content.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-lg border flex items-center space-x-2 ${
              message.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                : message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              ) : message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <Info className="h-5 w-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Email Verification Instructions */}
          {mode === 'confirmation' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                  Verification Email Sent!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-4">
                  We've sent a verification link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Please check your inbox and click the link to activate your account.
                  If you don't see the email, check your spam folder.
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  What happens next?
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>Check your email for the verification link</li>
                  <li>Click the link to verify your email address</li>
                  <li>Once verified, you can sign in to your account</li>
                  <li>Your health data will be securely stored in the cloud</li>
                </ol>
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Return to sign in
                </button>
                
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Refresh page
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Troubleshooting for Invalid Credentials */}
          {showTroubleshooting && mode === 'signin' && (
            <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-start space-x-2 text-amber-800 dark:text-amber-200">
                <HelpCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-2">Troubleshooting Sign-In Issues</p>
                  <ul className="text-sm space-y-1">
                    <li>• Double-check your email address for typos</li>
                    <li>• Ensure your password is correct (case-sensitive)</li>
                    <li>• Make sure Caps Lock is not enabled</li>
                    <li>• Try copying and pasting your credentials</li>
                    <li>• Use "Reset Password" if you've forgotten it</li>
                    <li>• Create a new account if you're a first-time user</li>
                  </ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                    >
                      Reset Password
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-800 dark:text-amber-200 px-2 py-1 rounded hover:bg-amber-200 dark:hover:bg-amber-700 transition-colors"
                    >
                      Create New Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields - Only show if not in confirmation mode */}
          {mode !== 'confirmation' && (
            <>
              {/* Full Name (Sign Up Only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password (Not for Reset) */}
              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your password"
                      required
                      minLength={8}
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
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
                  {mode === 'signup' && (
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
                  )}
                </div>
              )}

              {/* Additional Profile Fields for Signup */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* Advanced Fields Toggle */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {showAdvancedFields ? 'Hide additional fields' : 'Add more profile details (optional)'}
                    </button>
                  </div>

                  {/* Optional Advanced Fields */}
                  {showAdvancedFields && (
                    <div className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Emergency Contact (Optional)
                        </label>
                        <input
                          type="text"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Name and phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Doctor's Name (Optional)
                        </label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Your doctor's name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Doctor's Phone (Optional)
                        </label>
                        <input
                          type="text"
                          value={doctorPhone}
                          onChange={(e) => setDoctorPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Your doctor's phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Medical Conditions (Optional)
                        </label>
                        <textarea
                          value={medicalConditions}
                          onChange={(e) => setMedicalConditions(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                          placeholder="List any relevant medical conditions"
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (mode === 'signup' && !isPasswordValid())}
                className={`w-full py-3 rounded-lg hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-white ${
                  adminAccessRequested 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Please wait...</span>
                  </div>
                ) : (
                  <>
                    {mode === 'signin' && (adminAccessRequested ? 'Sign In to Access Admin' : 'Sign In')}
                    {mode === 'signup' && (adminAccessRequested ? 'Create Account for Admin Access' : 'Create Account')}
                    {mode === 'reset' && 'Send Reset Email'}
                  </>
                )}
              </button>
            </>
          )}

          {/* Mode Switching */}
          {mode === 'signin' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`font-medium hover:opacity-80 ${
                    adminAccessRequested 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Sign up
                </button>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Forgot your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className={`font-medium hover:opacity-80 ${
                    adminAccessRequested 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Reset it
                </button>
              </p>
            </div>
          )}

          {mode === 'signup' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`font-medium hover:opacity-80 ${
                    adminAccessRequested 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`font-medium hover:opacity-80 ${
                    adminAccessRequested 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </form>

        {/* Benefits Section */}
        {mode !== 'confirmation' && (
          <div className="px-6 pb-6">
            <div className={`rounded-lg p-4 ${
              adminAccessRequested 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                {adminAccessRequested ? '🔧 Admin Features' : '🌟 Benefits of Creating an Account'}
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {adminAccessRequested ? (
                  <>
                    <li>• 📊 Advanced analytics dashboard</li>
                    <li>• 📝 Content management system</li>
                    <li>• 👥 User data insights</li>
                    <li>• ⚙️ System configuration</li>
                    <li>• 🔒 Secure admin access</li>
                  </>
                ) : (
                  <>
                    <li>• 📱 Access your data from any device</li>
                    <li>• ☁️ Automatic cloud backup</li>
                    <li>• 👨‍⚕️ Share reports with your doctor</li>
                    <li>• 📊 Advanced analytics and insights</li>
                    <li>• 🔒 Secure and private data storage</li>
                  </>
                )}
              </ul>
            </div>

            {/* Admin Credentials Hint */}
            {adminAccessRequested && mode === 'signin' && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Admin Credentials
                </h5>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <li>Email: angel@email.com</li>
                  <li>Password: angel1234</li>
                </ul>
              </div>
            )}

            {/* Email Verification Notice */}
            {mode === 'signup' && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h5 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  Email Verification Required
                </h5>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  After signing up, you'll need to verify your email address before you can sign in.
                  We'll send a verification link to your email address.
                </p>
              </div>
            )}

            {/* General Troubleshooting Help */}
            {mode === 'signin' && !showTroubleshooting && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Need help signing in?
                </h5>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Make sure you're using the correct email address</li>
                  <li>• Check that your password is entered correctly</li>
                  <li>• Use "Reset Password" if you've forgotten your credentials</li>
                  <li>• Create a new account if you're a first-time user</li>
                </ul>
              </div>
            )}

            {/* First-time user guidance */}
            {mode === 'signup' && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                  Creating your first account?
                </h5>
                <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                  <li>• Use a valid email address you can access</li>
                  <li>• Choose a strong password that meets all requirements</li>
                  <li>• Your data will be securely stored and encrypted</li>
                  <li>• You can access your account from any device</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;