'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextValue {
    user: User | null;
    idToken: string | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    idToken: null,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                setIdToken(token);
            } else {
                setIdToken(null);
            }
            setLoading(false);
        });
        return unsub;
    }, []);

    // Refresh token every 45 minutes (tokens expire after 1 hour)
    useEffect(() => {
        if (!user) return;
        const interval = setInterval(async () => {
            const token = await user.getIdToken(true);
            setIdToken(token);
        }, 45 * 60 * 1000);
        return () => clearInterval(interval);
    }, [user]);

    const signInWithGoogle = useCallback(async () => {
        await signInWithPopup(auth, googleProvider);
    }, []);

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
        setIdToken(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, idToken, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
