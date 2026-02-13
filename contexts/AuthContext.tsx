import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import createContextHook from '@nkzw/create-context-hook';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.log('Error getting session:', error);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const stored = await AsyncStorage.getItem(`profile_${userId}`);
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const saveProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const newProfile: UserProfile = {
      id: user.id,
      email: user.email || '',
      displayName: updates.displayName || profile?.displayName,
      experienceLevel: updates.experienceLevel || profile?.experienceLevel || 'fresher',
      preferredCloud: updates.preferredCloud || profile?.preferredCloud || 'all',
      createdAt: profile?.createdAt || new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(`profile_${user.id}`, JSON.stringify(newProfile));
    setProfile(newProfile);
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const newProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          experienceLevel: 'fresher',
          preferredCloud: 'all',
          createdAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(`profile_${data.user.id}`, JSON.stringify(newProfile));
        setProfile(newProfile);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.log('Sign up error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.log('Sign in error:', error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
    } catch (error) {
      console.log('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.log('Reset password error:', error);
      return { error };
    }
  };

  return {
    session,
    user,
    profile,
    isLoading,
    isInitialized,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    saveProfile,
    resetPassword,
  };
});
