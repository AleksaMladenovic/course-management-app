import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
//import { auth } from "../firebase"; // Proveri putanju
import api from "../axios";

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dob?: string;
    role: 'korisnik' | 'autor';
    emailVerified?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    setVerified: (verified: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        //     if (firebaseUser) {
        //         try {
        //             // Povlačimo sve dodatne podatke iz tvoje baze
        //             const res = await api.get(`/User/${firebaseUser.uid}`);
        //             const userBaza = res.data;
                    
        //             const userData: User = {
        //                 id: firebaseUser.uid,
        //                 email: firebaseUser.email || "",
        //                 firstName: userBaza.firstName,
        //                 lastName: userBaza.lastName,
        //                 phone: userBaza.phone,
        //                 dob: userBaza.dob,
        //                 role: userBaza.role,
        //                 emailVerified: firebaseUser.emailVerified,
        //             };
        //             setUser(userData);
        //         } catch (err) {
        //             console.error("Greška pri povlačenju podataka korisnika", err);
        //         }
        //     } else {
        //         setUser(null);
        //     }
        //     setLoading(false);
        // });
        //return () => unsubscribe();
    }, []);

    const login = (userData: User) => setUser(userData);

    const logout = async () => {
        //await signOut(auth);
        setUser(null);
    };

    const setVerified = (verified: boolean) => {
        if (user) setUser({ ...user, emailVerified: verified });
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setVerified }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};