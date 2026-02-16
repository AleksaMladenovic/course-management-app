import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
//import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import api from "../axios";
import { auth } from "../firebase";
import type { DTORegisterAuthor } from "../interfaces/DTORegisterAuthor";
import type { DTORegisterStudent } from "../interfaces/DTORegisterStudent";
import type { DTOReturnLoginUserData } from "../interfaces/DTOReturnLoginUserData";
import RoleType from "../enums/RoleType";
import { useAuth } from "../context/AuthContext";

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
    const [errorData, setErrorData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dob: "",
        password: "",
        confirmPassword: "",
        role: ""
    });

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const { login } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const firebaseUser = userCredential.user;

            // Čuvanje dodatnih podataka u tvoju bazu preko API-ja
            if (formData.role === "autor") {
                const authorData: DTORegisterAuthor = {
                    FirebaseUid: firebaseUser.uid,
                    Name: formData.firstName,
                    Surname: formData.lastName,
                    Email: formData.email,
                    Telephone: formData.phone,
                    DateOfBirth: formData.dob
                };
                await api.post("/Author/register", authorData);
            }
            else {
                const studentData: DTORegisterStudent = {
                    FirebaseUid: firebaseUser.uid,
                    Name: formData.firstName,
                    Surname: formData.lastName,
                    Email: formData.email,
                    Telephone: formData.phone,
                    DateOfBirth: formData.dob
                };
                await api.post("/Student/register", studentData);
            }
            const data: DTOReturnLoginUserData = {
                email: formData.email,
                name: formData.firstName,
                surname: formData.lastName,
                telephone: formData.phone,
                dateOfBirth: formData.dob,
                role: formData.role === "autor" ? RoleType.Author : RoleType.Student
            }
            login(data);
            navigate("/");
        } catch (err: any) {
            if (err.code === "auth/email-already-in-use") {
                setError("Email adresa je već u upotrebi.");
            }
            else if (err.code === "auth/invalid-email") {
                setError("Neispravan format email adrese.");
            }
            else if (err.code === "auth/weak-password") {
                setError("Lozinka je previše slaba. Mora imati najmanje 6 karaktera.");
            }
            else {
                setError("Greška pri registraciji. Proverite podatke.");
            } 
            return;
        }
    };
    const validateForm: () => boolean = () => {
        let newErrorData = {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            dob: "",
            password: "",
            confirmPassword: "",
            role: ""
        };
        // NAME
        if (!formData.firstName.trim()) {
            newErrorData.firstName = "Ime je obavezno.";
        } else if (formData.firstName.length < 2 || formData.firstName.length > 30) {
            newErrorData.firstName = "Ime mora biti između 2 i 30 karaktera.";
        }

        // LAST NAME
        if (!formData.lastName.trim()) {
            newErrorData.lastName = "Prezime je obavezno.";
        } else if (formData.lastName.length < 2 || formData.lastName.length > 30) {
            newErrorData.lastName = "Prezime mora biti između 2 i 30 karaktera.";
        }

        // EMAIL
        if (!formData.email.trim()) {
            newErrorData.email = "Email je obavezan.";
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrorData.email = "Neispravan format email adrese.";
        }
        
        // PHONE
        if (!formData.phone.trim()) {
            newErrorData.phone = "Telefon je obavezan.";
        }else if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
            newErrorData.phone = "Neispravan format telefona.";
        }

        // DOB
        if (!formData.dob.trim()) {
            newErrorData.dob = "Datum rođenja je obavezan.";
        } else if (!newErrorData.dob) {
            const [year, month, day] = formData.dob.split("-").map(Number);
            const dobDate = new Date(year, (month || 1) - 1, day || 1);
            const isInvalidDate = Number.isNaN(dobDate.getTime());
            if (isInvalidDate) {
                newErrorData.dob = "Neispravan datum rođenja.";
            } else {
                const today = new Date();
                const minDob = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());
                if (dobDate > today) {
                    newErrorData.dob = "Datum rođenja ne može biti u budućnosti.";
                } else if (dobDate > minDob) {
                    newErrorData.dob = "Morate imati najmanje 12 godina.";
                }
            }
        }

        // PASSWORD
        if (!formData.password.trim()) {
            newErrorData.password = "Lozinka je obavezna.";
        } else if (formData.password.length < 6) {
            newErrorData.password = "Lozinka mora imati najmanje 6 karaktera.";
        }

        // CONFIRM PASSWORD
        if (formData.password !== formData.confirmPassword) {
            newErrorData.confirmPassword = "Lozinke se ne podudaraju.";
        }

        
        setErrorData(newErrorData);
        return Object.values(newErrorData).every(value => value === "");
    }
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
                                <input name="firstName" onChange={handleChange}
                                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                    placeholder="Ime" />
                            </div>
                            {errorData.firstName && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.firstName}</label>
                            )}
                        </div>

                        {/* Prezime */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Prezime</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                                <input name="lastName" onChange={handleChange}
                                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                    placeholder="Prezime" />
                            </div>
                            {errorData.lastName && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.lastName}</label>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email adresa</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400" />
                                <input name="email"  onChange={handleChange}
                                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                    placeholder="email@domen.com" />
                            </div>
                            {errorData.email && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.email}</label>
                            )}
                        </div>

                        {/* Telefon */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Telefon</label>
                            <input name="phone" onChange={handleChange}
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                placeholder="+381..." />
                            {errorData.phone && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.phone}</label>
                            )}
                        </div>

                        {/* Datum Rođenja */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Datum rođenja</label>
                            <input name="dob" type="date" onChange={handleChange}
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-slate-400" />
                            {errorData.dob && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.dob}</label>
                            )}
                        </div>

                        {/* Role Selector - Optimizovan za uske ekrane */}
                        <div className="sm:col-span-2 flex gap-1 p-1 bg-[#020617]/50 border border-slate-800 rounded-xl">
                            <button type="button" onClick={() => setFormData({ ...formData, role: 'korisnik' })}
                                className={`flex-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${formData.role === 'korisnik' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                                STUDENT
                            </button>
                            <button type="button" onClick={() => setFormData({ ...formData, role: 'autor' })}
                                className={`flex-1 py-2 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest transition-all ${formData.role === 'autor' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-white'}`}>
                                AUTOR
                            </button>
                        </div>

                        {/* Lozinke */}
                        <div className="space-y-1">
                            <input name="password" type="password" onChange={handleChange}
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                placeholder="Lozinka" />
                            {errorData.password && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.password}</label>
                            )}
                        </div>
                        <div className="space-y-1">
                            <input name="confirmPassword" type="password" onChange={handleChange}
                                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all text-xs sm:text-sm text-white"
                                placeholder="Potvrda" />
                            {errorData.confirmPassword && (
                                <label className="text-[9px] font-bold uppercase tracking-widest text-red-500 ml-1">{errorData.confirmPassword}</label>
                            )}
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