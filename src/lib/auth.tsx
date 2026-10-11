import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, pseudo: string, birthYear: number, consent: boolean) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const GUEST_STORAGE_KEY = 'cleanvibe_guest';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Restore guest state from localStorage on mount.
    try {
      if (localStorage.getItem(GUEST_STORAGE_KEY) === 'true') {
        setIsGuest(true);
      }
    } catch {
      // localStorage may be unavailable (private mode, SSR, etc.) — ignore.
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) {
        // A real session exists — guest mode must be off.
        setIsGuest(false);
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        // A real session exists — guest mode must be off.
        setIsGuest(false);
        (async () => {
          await loadProfile(newSession.user.id);
        })();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
    setLoading(false);
  }

  async function signUp(email: string, password: string, pseudo: string, birthYear: number, consent: boolean) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, pseudo, birth_year: birthYear, parental_consent: consent });
      if (profileError) return { error: profileError.message };
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    // Also clear guest mode on sign out.
    exitGuest();
  }

  function continueAsGuest() {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    } catch {
      // localStorage may be unavailable — ignore.
    }
    setIsGuest(true);
  }

  function exitGuest() {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch {
      // localStorage may be unavailable — ignore.
    }
    setIsGuest(false);
  }

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, loading, isGuest, signUp, signIn, signOut, continueAsGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
