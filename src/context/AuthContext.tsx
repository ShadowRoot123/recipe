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
    resetPassword: (email: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
    resetPassword: async () => { },
    updatePassword: async () => { },
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
        // Helper function to convert Supabase errors to user-friendly messages
        const getAuthErrorMessage = (error: any): string => {
            const message = error?.message?.toLowerCase() || '';

            if (message.includes('invalid login credentials')) {
                return 'Invalid email or password. Please try again.';
            }
            if (message.includes('email not confirmed')) {
                return 'Please confirm your email address before logging in.';
            }
            if (message.includes('user already registered')) {
                return 'An account with this email already exists.';
            }
            if (message.includes('password should be at least')) {
                return 'Password must be at least 6 characters long.';
            }
            if (message.includes('invalid email')) {
                return 'Please enter a valid email address.';
            }

            return error?.message || 'An error occurred. Please try again.';
        };

        const signIn = async (email: string, password: string) => {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                const userFriendlyError = new Error(getAuthErrorMessage(error));
                throw userFriendlyError;
            }
        };

        const signUp = async (email: string, password: string) => {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                const userFriendlyError = new Error(getAuthErrorMessage(error));
                throw userFriendlyError;
            }
        };

        const signOut = async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
                const userFriendlyError = new Error(getAuthErrorMessage(error));
                throw userFriendlyError;
            }
        };

        const resetPassword = async (email: string) => {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'myapp://reset-password', // You can customize this URL
            });
            if (error) {
                const userFriendlyError = new Error(getAuthErrorMessage(error));
                throw userFriendlyError;
            }
        };

        const updatePassword = async (newPassword: string) => {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
                const userFriendlyError = new Error(getAuthErrorMessage(error));
                throw userFriendlyError;
            }
        };

        return { user, session, loading, signIn, signUp, signOut, resetPassword, updatePassword };
    }, [user, session, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
