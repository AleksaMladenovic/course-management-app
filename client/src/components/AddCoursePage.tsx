import { useState } from "react";
import type { DTOAddCourse } from "../interfaces/DTOAddCourse";
import DificultyType, { DificultyTypeToString } from "../enums/DificultyType";
import type { DificultyType as DificultyTypeEnum } from "../enums/DificultyType";
import api from "../axios";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { 
    ChevronLeft, 
    BookPlus, 
    Type, 
    Clock, 
    AlignLeft, 
    BarChart, 
    Save, 
    Loader2 
} from "lucide-react";

const AddCoursePage = () => {
    const auth = getAuth();
    const navigate = useNavigate();

    const [name, setName] = useState<string>("");
    const [durationInWeeks, setDurationInWeeks] = useState<number>(1);
    const [description, setDescription] = useState<string>("");
    const [difficulty, setDifficulty] = useState<DificultyTypeEnum>(DificultyType.Easy);
    const [loading, setLoading] = useState(false);

    const onAddCourse = async (courseData: DTOAddCourse) => {
        setLoading(true);
        try {
            await api.post("Course/addCourse", courseData);
            alert("Kurs je uspešno kreiran!");
            navigate("/all-courses");
        } catch (error) {
            console.error("Error adding course:", error);
            alert("Došlo je do greške pri kreiranju kursa.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddCourse({
            name,
            durationInWeeks,
            description,
            difficulty,
            authorFirebaseId: auth.currentUser?.uid || "",
        });
    };

    return (
        <div className="w-full min-h-screen bg-[#0b0f1a] text-gray-100 pb-32 font-sans selection:bg-blue-500/30 overflow-x-hidden">
           
<div className="bg-[#141b2d] border-b border-white/5 relative overflow-hidden pt-12 pb-20">
    {/* Glow efekti (ostaju isti ali manje primetni) */}
    <div className="absolute top-[-20%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
    
    <div className="w-full px-8 md:px-24 relative z-10">
        {/* Smanjen mb sa 16 na 8 */}
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-[10px] font-black text-gray-500 hover:text-blue-400 mb-8 group transition-all uppercase tracking-[0.3em]"
        >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform mr-1" /> Nazad
        </button>

        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Smanjena ikona sa w-20 na w-14 */}
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 border border-blue-400/20">
                <BookPlus size={24} className="text-white" />
            </div>
            <div className="space-y-1">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] opacity-80">Dodavanje</span>
                {/* Smanjen font sa text-7xl na text-4xl/5xl */}
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">
                    Novog <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Kursa</span>
                </h1>
            </div>
        </div>
    </div>
</div>

            {/* FORMA*/}
            <main className="w-full px-8 md:px-24 mt-[-4px] relative z-20">
                <form 
                    onSubmit={handleSubmit}
                    className="max-w-5xl mx-auto bg-[#141b2d]/90 backdrop-blur-3xl border border-white/10 p-12 md:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] space-y-16"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* NAZIV KURSA */}
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                                <Type size={16} className="text-blue-500" /> Naziv Kursa
                            </label>
                            <input
                                type="text"
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-white outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all text-xl placeholder:text-gray-800 shadow-inner"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* TRAJANJE */}
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                                <Clock size={16} className="text-emerald-500" /> Trajanje (nedelje)
                            </label>
                            <input
                                type="number"
                                min={1}
                                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-white outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-all text-xl shadow-inner"
                                value={durationInWeeks}
                                onChange={e => setDurationInWeeks(Number(e.target.value))}
                                required
                            />
                        </div>
                    </div>

                    {/* OPIS */}
                    <div className="space-y-5">
                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                            <AlignLeft size={16} className="text-indigo-500" /> Opis Kursa
                        </label>
                        <textarea
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 text-white outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all text-xl min-h-[250px] leading-relaxed shadow-inner placeholder:text-gray-800"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    {/* TEŽINA (Moderni Radio Cards) */}
                    <div className="space-y-6">
                        <label className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">
                            <BarChart size={16} className="text-purple-500" /> Nivo Težine
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[DificultyType.Easy, DificultyType.Medium, DificultyType.Hard].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setDifficulty(type as DificultyTypeEnum)}
                                    className={`p-7 rounded-[2rem] border transition-all duration-500 font-black text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-3 ${
                                        difficulty === type 
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] scale-[1.05] z-10' 
                                        : 'bg-white/[0.02] border-white/5 text-gray-500 hover:border-white/20 hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {DificultyTypeToString[type as DificultyTypeEnum]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SUBMIT DUGME */}
                    <div className="pt-16 border-t border-white/5">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-blue-600 hover:text-white py-8 rounded-[2.5rem] transition-all duration-700 font-black uppercase text-sm tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    Kreiraj Kurs 
                                    <Save size={24} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default AddCoursePage;