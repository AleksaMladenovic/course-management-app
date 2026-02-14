import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleType from "../enums/RoleType";
import AllCourses from "./AllCourses";
import MyCoursesStudent from "./MyCoursesStudent";
import MyCoursesAuthor from "./MyCoursesAuthor";
import MyProfile from "./MyProfile";
import { Compass, Book, User, LogOut, Layout } from "lucide-react";

type ViewType = "allCourses" | "myCourses" | "profile";

const Header = () => {
    const { user, logout } = useAuth();
    // Koristimo jedan state za aktivni pogled
    const [activeView, setActiveView] = useState<ViewType>("allCourses");

    // Pomoćna funkcija za stilizovanje linkova
    const navLinkClass = (view: ViewType) => `
        flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all py-2 px-1 relative group
        ${activeView === view 
            ? 'text-blue-500' 
            : 'text-gray-500 hover:text-white'}
    `;

    return (
        <div className="w-full min-h-screen bg-[#0b0f1a] text-gray-100 font-sans selection:bg-blue-500/30 overflow-x-hidden">
            
            {/* --- FIXED HEADER --- */}
            <header className="fixed top-0 left-0 w-full z-[100] bg-[#0b0f1a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1440px] mx-auto px-8 md:px-16 xl:px-24 h-24 flex items-center justify-between">
                    

                    {/* CENTRALNA NAVIGACIJA */}
                    <nav className="flex items-center gap-8 md:gap-12">
                        <button 
                            onClick={() => setActiveView("allCourses")}
                            className={navLinkClass("allCourses")}
                        >
                            <Compass size={16} />
                            <span className="hidden md:block">Svi kursevi</span>
                            {activeView === "allCourses" && (
                                <div className="absolute -bottom-[33px] left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>

                        <button 
                            onClick={() => setActiveView("myCourses")}
                            className={navLinkClass("myCourses")}
                        >
                            <Book size={16} />
                            <span className="hidden md:block">Moji kursevi</span>
                            {activeView === "myCourses" && (
                                <div className="absolute -bottom-[33px] left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            )}
                        </button>
                    </nav>

                    {/* DESNI DEO - PROFIL I LOGOUT */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <button 
                            onClick={() => setActiveView("profile")}
                            className={`
                                flex items-center gap-3 p-1.5 pl-4 pr-1.5 rounded-2xl border transition-all group
                                ${activeView === "profile" 
                                    ? 'bg-blue-600/10 border-blue-500/30' 
                                    : 'bg-white/[0.03] border-white/5 hover:border-white/10'}
                            `}
                        >
                            <div className="text-right hidden lg:block">
                                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">
                                    {user?.role === RoleType.Author ? 'Autor' : 'Student'}
                                </p>
                                <p className="text-xs font-bold text-white uppercase tracking-tight">{user?.name}</p>
                            </div>
                            
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center transition-all
                                ${activeView === "profile" 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-slate-900 text-blue-500 group-hover:bg-blue-600 group-hover:text-white'}
                            `}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </button>

                        <button 
                            onClick={() => logout()}
                            className="p-3 bg-white/5 border border-white/5 rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            title="Odjavi se"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- CONTENT AREA --- */}
            {/* pt-24 je ključan jer je header fixed i zauzima prostor na vrhu */}
            <div className="w-full pt-32 px-8 md:px-16 xl:px-24">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Renderovanje na osnovu Role i State-a */}
                    {user?.role === RoleType.Student && (
                        <>
                            {activeView === "allCourses" && <AllCourses />}
                            {activeView === "myCourses" && <MyCoursesStudent />}
                            {activeView === "profile" && <MyProfile />}
                        </>
                    )}

                    {user?.role === RoleType.Author && (
                        <>
                            {activeView === "allCourses" && <AllCourses />}
                            {activeView === "myCourses" && <MyCoursesAuthor />}
                            {activeView === "profile" && <MyProfile />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;