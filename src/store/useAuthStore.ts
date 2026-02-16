import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../lib/database.types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: 'client' | 'talent', metadata?: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch public user profile
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          set({ user: profile as User, isAuthenticated: true, loading: false });
        } else {
          // Fallback if profile doesn't exist yet (race condition with trigger)
          set({ 
            user: { 
              id: session.user.id, 
              email: session.user.email!, 
              name: session.user.user_metadata.name || '',
              role: session.user.user_metadata.role || 'client',
              created_at: session.user.created_at
            } as User,
            isAuthenticated: true, 
            loading: false 
          });
        }
      } else {
        set({ user: null, isAuthenticated: false, loading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
           const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
           if (profile) {
             set({ user: profile as User, isAuthenticated: true, loading: false });
           }
        } else {
          set({ user: null, isAuthenticated: false, loading: false });
        }
      });
      
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      throw error;
    }
    // State update handled by onAuthStateChange
  },

  register: async (email, password, name, role, metadata = {}) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...metadata,
        },
      },
    });
    
    if (error) {
      set({ loading: false });
      throw error;
    }
    // State update handled by onAuthStateChange
  },

  logout: async () => {
    set({ loading: true });
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    set({ user: null, isAuthenticated: false, loading: false });
    if (error) {
      return;
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;
    
    set({ user: { ...user, ...updates } });
  }
}));
