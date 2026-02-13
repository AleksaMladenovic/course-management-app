import { useAuth } from "../context/AuthContext";
import RoleType from "../enums/RoleType";
import { User, Mail, Shield, Settings, Calendar, Award } from "lucide-react";

const MyProfile = () => {
    const { user } = useAuth();

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* --- HEADER SEKCIJA --- */}
            <div className="flex items-center gap-4 mb-12">
                <div className="h-8 w-1.5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Moj Profil</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* --- LEVA KOLONA: AVATAR & OSNOVNO --- */}
                <div className="xl:col-span-1">
                    <div className="bg-[#141b2d] border border-white/5 p-10 rounded-[3rem] shadow-2xl flex flex-col items-center text-center relative overflow-hidden group">
                        {/* Glow u pozadini */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
                        
                        {/* Avatar / Inicijali */}
                        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black shadow-2xl mb-6 border-4 border-white/5 transition-transform duration-500 group-hover:scale-105">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{user?.name}{" "}{user?.surname}</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 mb-8">
                            {user?.role === RoleType.Author ? "Author" : "Student"}
                        </p>

                        <div className="w-full pt-8 border-t border-white/5 flex flex-col gap-3">
                            <button className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                <Settings size={14} /> Podešavanja
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- DESNA KOLONA: DETALJI --- */}
                <div className="xl:col-span-2">
                    <div className="bg-[#141b2d] border border-white/5 p-10 md:p-14 rounded-[3rem] shadow-2xl h-full">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-10 ml-2">Informacije o nalogu</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            
                            {/* IME */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                    <User size={14} /> Puno ime
                                </div>
                                <div className="bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200">
                                    {user?.name}{" "}{user?.surname}
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Mail size={14} /> Email adresa
                                </div>
                                <div className="bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200 overflow-hidden text-ellipsis">
                                    {user?.email}
                                </div>
                            </div>

                            {/* ULOGA */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                    <Shield size={14} /> Uloga na platformi
                                </div>
                                <div className="flex items-center gap-3 bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200">
                                    <span className={`w-3 h-3 rounded-full ${user?.role === RoleType.Author ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                    {user?.role === RoleType.Author ? "Autor" : "Student"}
                                </div>
                            </div>

                        </div>

                        {/* DODATNA SEKCIJA ZA STATISTIKU (PLACEHOLDER) */}
                        <div className="mt-16 grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                            <div className="text-center">
                                <p className="text-2xl font-black text-white">3</p>
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Kurseva</p>
                            </div>
                            <div className="text-center border-x border-white/5">
                                <p className="text-2xl font-black text-white">15</p>
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Studenata</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mali pomoćni UI element za kvačicu
const CheckCircleIcon = () => (
    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
    </div>
);

export default MyProfile;