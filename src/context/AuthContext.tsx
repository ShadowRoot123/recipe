import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        // Get initial session
        supabase.auth.getSession().then(({ data, error }) => {
            if (!isMounted) return;
            if (error) {
                console.error('Error fetching session:', error);
                setLoading(false);
                return;
            }
            setSession(data.session ?? null);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!isMounted) return;
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setLoading(false);
        });

        return () => {
            isMounted = false;
            data.subscription.unsubscribe();
        };
    }, []);

    const value = useMemo<AuthContextType>(() => {
        const signIn = async (email: string, password: string) => {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
        };

        const signUp = async (email: string, password: string) => {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;
        };

        const signOut = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        };

        return { user, session, loading, signIn, signUp, signOut };
    }, [user, session, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
