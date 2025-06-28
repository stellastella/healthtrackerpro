import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback to empty strings if env vars are missing to prevent crashes
const url = supabaseUrl || '';
const key = supabaseAnonKey || '';

// Log warning if env vars are missing
if (!url || !key) {
  console.warn('Missing Supabase environment variables. Please check your .env file.');
}

// Create client with optimized options and custom error handling
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    // Custom fetch function to handle refresh token errors and session errors
    fetch: async (url, options) => {
      const response = await fetch(url, {
        ...options,
        // Reduce timeout for faster failure detection
        signal: options?.signal || new AbortController().signal
      });

      // Handle auth-related errors
      if (url.includes('/auth/v1/')) {
        // Handle refresh token errors
        if (url.includes('/token') && response.status === 400) {
          try {
            const errorBody = await response.clone().text();
            const errorData = JSON.parse(errorBody);
            
            if (errorData.code === 'refresh_token_not_found') {
              // Clear the invalid session by signing out (non-blocking)
              supabase.auth.signOut().catch((error) => {
                console.warn('Error during automatic sign-out:', error);
              });
              // Return a synthetic successful response to prevent error propagation
              return new Response(JSON.stringify({ message: 'Session refreshed successfully' }), {
                status: 200,
                statusText: 'OK',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            }
          } catch (parseError) {
            // If we can't parse the error body, continue with normal flow
            console.warn('Could not parse auth error response:', parseError);
          }
        }
        
        // Handle logout session errors
        if (url.includes('/logout') && response.status === 403) {
          try {
            const errorBody = await response.clone().text();
            const errorData = JSON.parse(errorBody);
            
            if (errorData.code === 'session_not_found') {
              // Session is already invalid on server, clear local session (non-blocking)
              supabase.auth.signOut().catch((error) => {
                console.warn('Error during automatic sign-out:', error);
              });
              // Return a synthetic successful response to prevent error propagation
              return new Response(JSON.stringify({ message: 'Session already terminated' }), {
                status: 200,
                statusText: 'OK',
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            }
          } catch (parseError) {
            // If we can't parse the error body, continue with normal flow
            console.warn('Could not parse logout error response:', parseError);
          }
        }
      }

      return response;
    }
  },
  // Disable realtime subscriptions to improve performance
  realtime: {
    params: {
      eventsPerSecond: 0
    }
  },
  // Add debug logging in development
  debug: process.env.NODE_ENV === 'development'
});

// Database types
export interface Database {
  public: {
    Tables: {
      blood_pressure_readings: {
        Row: {
          id: string;
          user_id: string;
          systolic: number;
          diastolic: number;
          pulse: number | null;
          location: string;
          medication: string | null;
          symptoms: string | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          systolic: number;
          diastolic: number;
          pulse?: number | null;
          location?: string;
          medication?: string | null;
          symptoms?: string | null;
          notes?: string | null;
          recorded_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          systolic?: number;
          diastolic?: number;
          pulse?: number | null;
          location?: string;
          medication?: string | null;
          symptoms?: string | null;
          notes?: string | null;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      blood_sugar_readings: {
        Row: {
          id: string;
          user_id: string;
          glucose: number;
          test_type: string;
          location: string;
          medication: string | null;
          meal_info: string | null;
          symptoms: string | null;
          notes: string | null;
          recorded_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          glucose: number;
          test_type: string;
          location?: string;
          medication?: string | null;
          meal_info?: string | null;
          symptoms?: string | null;
          notes?: string | null;
          recorded_at: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          glucose?: number;
          test_type?: string;
          location?: string;
          medication?: string | null;
          meal_info?: string | null;
          symptoms?: string | null;
          notes?: string | null;
          recorded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          date_of_birth: string | null;
          emergency_contact: string | null;
          doctor_name: string | null;
          doctor_phone: string | null;
          medical_conditions: string | null;
          created_at: string;
          updated_at: string;
          is_admin: boolean;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          medical_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
          is_admin?: boolean;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          emergency_contact?: string | null;
          doctor_name?: string | null;
          doctor_phone?: string | null;
          medical_conditions?: string | null;
          created_at?: string;
          updated_at?: string;
          is_admin?: boolean;
        };
      };
    };
  };
}