import React, { useState } from 'react';
import { Mail, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';

interface EmailVerificationBannerProps {
  className?: string;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isVisible, setIsVisible] = useState(true);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [countdown, setCountdown] = useState(0);

  // Check if user exists but email is not confirmed
  const needsVerification = user && !user.email_confirmed_at;

  const handleResendVerification = async () => {
    if (countdown > 0 || !user?.email) return;
    
    setResendStatus('sending');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });
      
      if (error) {
        console.error('Error resending verification email:', error);
        setResendStatus('error');
      } else {
        setResendStatus('success');
        // Start countdown for 60 seconds
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus('error');
    }
  };

  if (!needsVerification || !isVisible) return null;

  return (
    <div className={`${
      isDark ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
    } border-l-4 p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <AlertCircle className={`h-5 w-5 mt-0.5 ${
            isDark ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${
              isDark ? 'text-yellow-300' : 'text-yellow-800'
            }`}>
              Please verify your email address
            </h3>
            <div className={`mt-1 text-sm ${
              isDark ? 'text-yellow-200' : 'text-yellow-700'
            }`}>
              <p>
                A verification link has been sent to <strong>{user?.email}</strong>.
                Please check your inbox and click the link to verify your account.
              </p>
              <div className="mt-2">
                <button
                  onClick={handleResendVerification}
                  disabled={resendStatus === 'sending' || countdown > 0}
                  className={`inline-flex items-center text-sm font-medium ${
                    isDark 
                      ? 'text-yellow-300 hover:text-yellow-200' 
                      : 'text-yellow-800 hover:text-yellow-900'
                  } ${(resendStatus === 'sending' || countdown > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {resendStatus === 'sending' ? (
                    <>
                      <div className="w-3 h-3 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend available in ${countdown}s`
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-1" />
                      Resend verification email
                    </>
                  )}
                </button>
                
                {resendStatus === 'success' && (
                  <div className="mt-2 flex items-center text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verification email sent!
                  </div>
                )}
                
                {resendStatus === 'error' && (
                  <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Failed to send. Please try again later.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className={`ml-4 flex-shrink-0 ${
            isDark ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-800'
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;