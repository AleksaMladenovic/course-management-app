import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
//import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { auth } from "../firebase";
import api from "../axios";
import type { DTOReturnLoginUserData } from "../interfaces/DTOReturnLoginUserData";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase user:", user);
            const userData: DTOReturnLoginUserData = (await api.post(`/User/login?firebaseUid=${user.uid}`)).data;
            console.log("User data from backend:", userData);
            login(userData);
            navigate("/all-courses");
        } catch (err) {
            setError("Pogrešan email ili lozinka.");
        }
    };

    return (
    <div className="fixed inset-0 w-full h-full bg-[#020617] flex items-center justify-center overflow-y-auto overflow-x-hidden">
        
        {/* Pozadinski efekti - koristimo fixed da se ne pomeraju pri skrolovanju */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-indigo-500/10 blur-[80px] sm:blur-[130px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-600/5 blur-[80px] sm:blur-[130px] rounded-full" />
        </div>

        {/* Glavni kontejner koji omogućava vertikalni margin na malim ekranima */}
        <div className="min-h-full w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                // Responsive širina i padding
                className="w-full max-w-[420px] bg-[#0f172a]/40 backdrop-blur-3xl border border-white/5 
                           p-6 sm:p-10 md:p-12 
                           rounded-[2rem] sm:rounded-[2.5rem] 
                           shadow-2xl relative z-10 my-auto"
            >
                {/* Header sekcija */}
                <div className="text-center mb-8 sm:mb-10">
                    <div className="inline-flex p-3 sm:p-4 bg-indigo-500/10 rounded-2xl mb-4 sm:mb-6">
                        <LogIn className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Prijavi se</h2>
                    <p className="text-slate-400 mt-2 text-xs sm:text-sm">Unesite podatke za pristup platformi</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
                    {/* Email polje */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email adresa</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="email" 
                                required 
                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl sm:rounded-2xl 
                                           pl-11 sm:pl-12 pr-4 py-3 sm:py-4 
                                           focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all 
                                           text-sm sm:text-base text-white placeholder:text-slate-600" 
                                placeholder="tvoj@email.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Password polje */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Lozinka</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input 
                                type="password" 
                                required 
                                className="w-full bg-[#1e293b]/40 border border-slate-800 rounded-xl sm:rounded-2xl 
                                           pl-11 sm:pl-12 pr-4 py-3 sm:py-4 
                                           focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all 
                                           text-sm sm:text-base text-white placeholder:text-slate-600" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Submit dugme */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold 
                                   py-3 sm:py-4 rounded-xl sm:rounded-2xl 
                                   transition-all shadow-[0_10px_30px_-10px_rgba(79,70,229,0.5)] 
                                   active:scale-[0.98] text-sm sm:text-base"
                    >
                        Prijavi se
                    </button>
                </form>

                {/* Footer link */}
                <div className="mt-8 sm:mt-10 text-center">
                    <p className="text-slate-500 text-xs sm:text-sm">
                        Nemaš nalog?{" "}
                        <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline-offset-4 hover:underline">
                            Registruj se
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    </div>
);
};

export default Login;