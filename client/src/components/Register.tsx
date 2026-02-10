import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
//import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../axios";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
        role: "korisnik",
        password: "",
        confirmPassword: ""
    });
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Lozinke se ne podudaraju.");
            return;
        }

        try {
            ////const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
           // const firebaseUser = userCredential.user;

            // Čuvanje dodatnih podataka u tvoju bazu preko API-ja
            await api.post("/User", {
                //id: firebaseUser.uid,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                dob: formData.dob,
                role: formData.role
            });

            navigate("/");
        } catch (err: any) {
            setError("Greška pri registraciji. Proverite podatke.");
        }
    };

    return (
        
    <div className="fixed inset-0 w-full h-full bg-[#020617] flex items-center justify-center overflow-y-auto overflow-x-hidden">
        
        {/* Pozadinski efekti - smanjeni za mobilni da ne bi pravili lag */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-5%] right-[-5%] w-[300px] h-[300px] bg-indigo-600/10 blur-[80px] rounded-full opacity-50 sm:opacity-100" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[250px] h-[250px] bg-blue-600/5 blur-[80px] rounded-full opacity-50 sm:opacity-100" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            // Ključne promene: w-full, manji padding p-4 na mobilnom, manji rounded
            className="w-full max-w-lg bg-[#0f172a]/40 backdrop-blur-2xl border border-white/5 
                       p-4 sm:p-8 md:p-10
                       rounded-2xl sm:rounded-[2.5rem] 
                       shadow-2xl relative z-10 my-4"
        >
            <div className="text-center mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Napravi nalog</h2>
                <p className="text-slate-400 mt-1 text-[10px] sm:text-xs uppercase tracking-widest">Edukativna platforma</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-xl text-[10px] text-center italic">
                        {error}
                    </div>
                )}

                {/* Grid sistem koji se prilagođava */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* Ime */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Ime</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                            <input name="firstName" required onChange={handleChange} 
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                                placeholder="Ime" />
                        </div>
                    </div>

                    {/* Prezime */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prezime</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                            <input name="lastName" required onChange={handleChange} 
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                                placeholder="Prezime" />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1 sm:col-span-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email adresa</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                            <input name="email" type="email" required onChange={handleChange} 
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                                placeholder="email@domen.com" />
                        </div>
                    </div>

                    {/* Telefon */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Telefon</label>
                        <input name="phone" required onChange={handleChange} 
                            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                            placeholder="+381..." />
                    </div>

                    {/* Datum Rođenja */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Datum rođenja</label>
                        <input name="dob" type="date" required onChange={handleChange} 
                            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-slate-400" />
                    </div>

                    {/* Role Selector - Optimizovan za uske ekrane */}
                    <div className="sm:col-span-2 flex gap-1 p-1 bg-[#020617]/50 border border-slate-800 rounded-xl">
                        <button type="button" onClick={() => setFormData({...formData, role: 'korisnik'})} 
                            className={`flex-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${formData.role === 'korisnik' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                            STUDENT
                        </button>
                        <button type="button" onClick={() => setFormData({...formData, role: 'autor'})} 
                            className={`flex-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${formData.role === 'autor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                            AUTOR
                        </button>
                    </div>

                    {/* Lozinke */}
                    <div className="space-y-1">
                        <input name="password" type="password" required onChange={handleChange} 
                            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                            placeholder="Lozinka" />
                    </div>
                    <div className="space-y-1">
                        <input name="confirmPassword" type="password" required onChange={handleChange} 
                            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white" 
                            placeholder="Potvrda" />
                    </div>
                </div>

                <button type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group mt-2 active:scale-95 text-xs sm:text-sm shadow-lg shadow-indigo-600/20">
                    REGISTRUJ SE
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-500 text-[10px] sm:text-[11px]">
                    Već imaš nalog? <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300">Prijavi se</Link>
                </p>
            </div>
        </motion.div>
    </div>
);
};

export default Register;