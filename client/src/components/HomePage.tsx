import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    return (
        <div className="fixed inset-0 w-full h-full bg-[#020617] flex items-center justify-center overflow-y-auto overflow-x-hidden">

            {/* --- POZADINSKI GLOW EFEKTI --- */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="relative z-10 text-center px-6">

                {/* --- NASLOV --- */}
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase leading-[0.8] mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Course <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500">
                        Management
                    </span>
                </h1>

                {/* --- OPIS (OPCIONO, MOŽEŠ OBRISATI AKO ŽELIŠ TOTALNI MINIMALIZAM) --- */}
                <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-[0.5em] mb-16 opacity-60 animate-in fade-in duration-1000">
                    Ultimate Learning Platform
                </p>

                {/* --- DUGMIĆI --- */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    {user === null ? (
                        <>
                            {/* LOGIN DUGME */}
                            <button
                                onClick={() => navigate("/login")}
                                className="group flex items-center justify-center gap-4 bg-white text-black hover:bg-blue-500 hover:text-white px-12 py-6 rounded-[2rem] transition-all duration-500 font-black uppercase text-xs tracking-[0.2em] shadow-2xl min-w-[240px] active:scale-95"
                            >
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                Log In
                            </button>

                            {/* REGISTER DUGME */}
                            <button
                                onClick={() => navigate("/register")}
                                className="group flex items-center justify-center gap-4 bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600 text-white px-12 py-6 rounded-[2rem] transition-all duration-500 font-black uppercase text-xs tracking-[0.2em] min-w-[240px] active:scale-95"
                            >
                                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/all-courses")}
                                className="group flex items-center justify-center gap-4 bg-blue-600 text-white px-12 py-6 rounded-[2rem] transition-all duration-500 font-black uppercase text-xs tracking-[0.2em] shadow-2xl min-w-[240px] active:scale-95">
                                Explore Courses
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;