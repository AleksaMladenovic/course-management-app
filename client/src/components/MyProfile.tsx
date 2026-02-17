import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import RoleType from "../enums/RoleType";
import { User, Mail, Shield, Settings } from "lucide-react";
import type { DTOAuthorStats } from "../interfaces/DTOAuthorStats";
import api from "../axios";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import type DTOStudentsStats from "../interfaces/DTOStudentsStats";

const MyProfile = () => {
    const { user } = useAuth();
    const [authorStats, setAuthorStats] = useState<DTOAuthorStats  | null>(null);
    const [studentStats, setStudentStats] = useState<DTOStudentsStats | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    useEffect(() => {
        if (user !== null && user.role === RoleType.Author) {
            api.get<DTOAuthorStats>(`/Author/${getAuth().currentUser?.uid}/stats`)
                .then((response) => setAuthorStats(response.data))
                .catch((error) => console.error("Error fetching author stats:", error));
        } else if (user !== null && user.role === RoleType.Student) {
            api.get<DTOStudentsStats>(`/Student/${getAuth().currentUser?.uid}/stats`)
                .then((response) => setStudentStats(response.data))
                .catch((error) => console.error("Error fetching student stats:", error));
        }
    }, [user]);

    const handleChangePassword = async () => {
        setPasswordMessage(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage({ type: "error", text: "Popunite sva polja za promenu šifre." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: "error", text: "Nova šifra i potvrda se ne poklapaju." });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: "error", text: "Nova šifra mora imati najmanje 6 karaktera." });
            return;
        }

        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser || !currentUser.email) {
            setPasswordMessage({ type: "error", text: "Korisnik nije prijavljen. Pokušajte ponovo." });
            return;
        }

        setIsUpdatingPassword(true);

        try {
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordMessage({ type: "success", text: "Šifra je uspešno promenjena." });
        } catch (error: any) {
            const errorCode = error?.code as string | undefined;

            if (errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
                setPasswordMessage({ type: "error", text: "Trenutna šifra nije ispravna." });
            } else if (errorCode === "auth/too-many-requests") {
                setPasswordMessage({ type: "error", text: "Previše pokušaja. Pokušajte ponovo za par minuta." });
            } else if (errorCode === "auth/requires-recent-login") {
                setPasswordMessage({ type: "error", text: "Potrebna je ponovna prijava pre promene šifre." });
            } else {
                setPasswordMessage({ type: "error", text: "Došlo je do greške pri promeni šifre." });
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

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

                        <h3 className="user-name text-2xl font-black text-white uppercase tracking-tight">{user?.name}{" "}{user?.surname}</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2 mb-8">
                            {user?.role === RoleType.Author ? "Author" : "Student"}
                        </p>

                        <div className="w-full pt-8 border-t border-white/5 flex flex-col gap-3">
                            <button
                                onClick={() => setIsSettingsOpen((prev) => !prev)}
                                className={`user-settings w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                                    isSettingsOpen
                                        ? "bg-blue-600/10 border-blue-500/30 text-blue-300"
                                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                                }`}
                            >
                                <Settings size={14} /> Podešavanja
                            </button>

                            {isSettingsOpen && (
                                <div className="w-full mt-2 p-4 rounded-2xl border border-white/10 bg-black/20 text-left space-y-3">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Promena šifre</p>

                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="Trenutna šifra"
                                        className="current-password w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />

                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Nova šifra"
                                        className="new-password w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />

                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Potvrda nove šifre"
                                        className="confirm-password w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    />

                                    {passwordMessage && (
                                        <p className={`password-message text-[10px] font-black uppercase tracking-wider ${
                                            passwordMessage.type === "success" ? "text-emerald-400" : "text-red-400"
                                        }`}>
                                            {passwordMessage.text}
                                        </p>
                                    )}

                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isUpdatingPassword}
                                        className="change-password-button w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isUpdatingPassword ? "Čuvanje..." : "Sačuvaj novu šifru"}
                                    </button>
                                </div>
                            )}
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
                                <div className="user-fullname bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200">
                                    {user?.name}{" "}{user?.surname}
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Mail size={14} /> Email adresa
                                </div>
                                <div className="user-email bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200 overflow-hidden text-ellipsis">
                                    {user?.email}
                                </div>
                            </div>

                            {/* ULOGA */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black text-purple-500 uppercase tracking-widest">
                                    <Shield size={14} /> Uloga na platformi
                                </div>
                                <div className="user-role flex items-center gap-3 bg-black/20 border border-white/5 p-5 rounded-2xl text-lg font-bold text-gray-200">
                                    <span className={`w-3 h-3 rounded-full ${user?.role === RoleType.Author ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                    {user?.role === RoleType.Author ? "Autor" : "Student"}
                                </div>
                            </div>

                        </div>

                        {/* DODATNA SEKCIJA ZA STATISTIKU (PLACEHOLDER) */}
                        {user?.role === RoleType.Author && (
                            <div className="mt-16 grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                                <div className="text-center">
                                    <p className="author-total-courses text-2xl font-black text-white">{authorStats?.totalCourses ?? 0}</p>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Kurseva</p>
                                </div>
                                <div className="text-center border-x border-white/5">
                                    <p className="author-total-students text-2xl font-black text-white">{authorStats?.totalStudents ?? 0}</p>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Studenata</p>
                                </div>
                            </div>)
                        }
                        {user?.role === RoleType.Student && (
                            <div className="mt-16 grid pt-10 border-t border-white/5">
                                <div className="text-center">
                                    <p className="student-total-courses text-2xl font-black text-white">{studentStats?.totalCourses ?? 0}</p>
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">Kurseva</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyProfile;