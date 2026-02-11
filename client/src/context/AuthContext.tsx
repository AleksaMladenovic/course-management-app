import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase"; 
import api from "../axios";
import type { DTOReturnLoginUserData } from "../interfaces/DTOReturnLoginUserData";


interface AuthContextType {
    user: DTOReturnLoginUserData | null;
    loading: boolean;
    login: (userData: DTOReturnLoginUserData) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<DTOReturnLoginUserData | null>(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? (JSON.parse(storedUser) as DTOReturnLoginUserData) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser) as DTOReturnLoginUserData);
                    setLoading(false);
                    return;
                }
                try {
                    // Povlačimo sve dodatne podatke iz tvoje baze
                    const res = await api.post<DTOReturnLoginUserData>(`/User/login`, { firebaseId: firebaseUser.uid });
                    const userBaza = res.data;
                    
                    setUser(userBaza);
                    localStorage.setItem("user", JSON.stringify(userBaza));
                } catch (err) {
                    console.error("Greška pri povlačenju podataka korisnika", err);
                }
            } else {
                setUser(null);
                localStorage.removeItem("user");
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (userData: DTOReturnLoginUserData) => {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
    };

    const logout = async () => {
        //await signOut(auth);
        setUser(null);
        localStorage.removeItem("user");
    };
    
    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};