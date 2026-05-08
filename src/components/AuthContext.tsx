import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  subscriptionTier: 'free' | 'pro';
  upgradeToPro: () => void;
  toggleSubscriptionTier: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadataTier = session.user.user_metadata?.subscription_tier;
        const pendingTier = localStorage.getItem('sierra_pending_tier') as 'free' | 'pro' | null;
        
        if (metadataTier) {
          setSubscriptionTier(metadataTier);
          if (pendingTier) localStorage.removeItem('sierra_pending_tier'); // Cleanup if metadata already exists
        } else if (pendingTier) {
          setSubscriptionTier(pendingTier);
          // Update user metadata so it's persisted in Supabase
          supabase.auth.updateUser({
            data: { subscription_tier: pendingTier }
          });
          localStorage.removeItem('sierra_pending_tier');
        } else {
          setSubscriptionTier('free');
        }
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const metadataTier = session.user.user_metadata?.subscription_tier;
        const pendingTier = localStorage.getItem('sierra_pending_tier') as 'free' | 'pro' | null;

        if (metadataTier) {
          setSubscriptionTier(metadataTier);
          if (pendingTier) localStorage.removeItem('sierra_pending_tier');
        } else if (pendingTier) {
          setSubscriptionTier(pendingTier);
          supabase.auth.updateUser({
            data: { subscription_tier: pendingTier }
          });
          localStorage.removeItem('sierra_pending_tier');
        } else {
          setSubscriptionTier('free');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const upgradeToPro = async () => {
    setSubscriptionTier('pro');
    if (user) {
      await supabase.auth.updateUser({
        data: { subscription_tier: 'pro' }
      });
    }
  };

  const toggleSubscriptionTier = async () => {
    const newTier = subscriptionTier === 'free' ? 'pro' : 'free';
    setSubscriptionTier(newTier);
    if (user) {
      await supabase.auth.updateUser({
        data: { subscription_tier: newTier }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, subscriptionTier, upgradeToPro, toggleSubscriptionTier }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
