import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError, AuthApiError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName?: string, profileData?: any) => Promise<{ error: AuthError | null; emailConfirmationSent?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const createUserProfile = async (userId: string, email: string, profileData?: any) => {
    try {
      const profile = {
        id: userId,
        full_name: profileData?.full_name || email.split('@')[0],
        date_of_birth: profileData?.date_of_birth || null,
        emergency_contact: profileData?.emergency_contact || null,
        doctor_name: profileData?.doctor_name || null,
        doctor_phone: profileData?.doctor_phone || null,
        medical_conditions: profileData?.medical_conditions || null,
        is_admin: false // Default to non-admin
      };

      const { error } = await supabase
        .from('user_profiles')
        .upsert([profile], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error creating user profile:', error);
      }
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  // Check if user is admin - with error handling and caching
  const checkAdminStatus = async (userId: string) => {
    try {
      // Check cache first
      const cachedAdminStatus = localStorage.getItem(`admin_status_${userId}`);
      if (cachedAdminStatus) {
        setIsAdmin(cachedAdminStatus === 'true');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      // If no profile exists, create one
      if (!data) {
        const currentUser = await supabase.auth.getUser();
        if (currentUser.data.user) {
          await createUserProfile(userId, currentUser.data.user.email || '');
          // After creating profile, set admin status to false
          setIsAdmin(false);
          localStorage.setItem(`admin_status_${userId}`, 'false');
          setTimeout(() => {
            localStorage.removeItem(`admin_status_${userId}`);
          }, 5 * 60 * 1000);
        }
        return;
      }

      const adminStatus = data?.is_admin || false;
      setIsAdmin(adminStatus);
      
      // Cache the result for 5 minutes
      localStorage.setItem(`admin_status_${userId}`, adminStatus.toString());
      setTimeout(() => {
        localStorage.removeItem(`admin_status_${userId}`);
      }, 5 * 60 * 1000);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await checkAdminStatus(session.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Continue with null user if auth fails
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);

      // Create user profile on sign up
      if (event === 'SIGNED_UP' && session?.user) {
        await createUserProfile(session.user.id, session.user.email || '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const validatePassword = (password: string): boolean => {
    // Check for minimum length of 8 characters
    if (password.length < 8) return false;
    
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) return false;
    
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) return false;
    
    // Check for at least one number
    if (!/[0-9]/.test(password)) return false;
    
    return true;
  };

  const signUp = async (email: string, password: string, fullName?: string, profileData?: any) => {
    try {
      // Validate password
      if (!validatePassword(password)) {
        return { 
          error: {
            message: 'Password must be at least 8 characters long and include uppercase, lowercase, and numbers.',
            status: 400
          } as AuthError 
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`
        }
      });

      // Check if email confirmation was sent
      const emailConfirmationSent = !error && data?.user?.identities?.length === 0;

      // If signup was successful, create user profile
      if (!error && data?.user) {
        await createUserProfile(data.user.id, email, profileData);
      }

      return { error, emailConfirmationSent: !!emailConfirmationSent };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Handle the case where the session doesn't exist on the server
      // This should be treated as a successful sign-out, not an error
      if (error && error instanceof AuthApiError) {
        if (error.message === 'Session from session_id claim in JWT does not exist') {
          // Session is already invalid/expired on server, treat as successful sign-out
          return { error: null };
        }
      }
      
      return { error };
    } catch (error) {
      // Handle any other unexpected errors
      if (error instanceof AuthApiError && 
          error.message === 'Session from session_id claim in JWT does not exist') {
        // Session is already invalid/expired on server, treat as successful sign-out
        return { error: null };
      }
      
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      // Get the current origin for the redirect URL
      const origin = window.location.origin;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/reset-password`,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};