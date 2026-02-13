import { useNavigate } from "react-router-dom";
import { DificultyTypeToString, type DificultyType } from "../enums/DificultyType";
import { Clock, BarChart, User, ArrowRight, BookOpen } from "lucide-react";

export interface CourseCardProps {
    id: string;
    name: string;
    durationInWeeks: number;
    dificulty: DificultyType;
    authorName: string;
    authorSurname: string;
    authorId: string;
}

const CourseCard: React.FC<CourseCardProps> = ({ 
    id, 
    name, 
    durationInWeeks, 
    dificulty, 
    authorName, 
    authorSurname, 
    authorId 
}) => {
    const navigate = useNavigate();
    
    const onMoreDetailsClick = () => {
        navigate(`/course/${id}`);
    }

    return (
        <div 
            onClick={onMoreDetailsClick}
            className="group relative bg-[#1e293b]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 
                       transition-all duration-500 hover:border-blue-500/30 hover:bg-[#1e293b]/60 
                       hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] cursor-pointer flex flex-col h-full overflow-hidden"
        >
            {/* Dekorativni sjaj u uglu koji se pojavljuje na hover */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full 
                            group-hover:bg-blue-500/20 transition-all duration-700" />

            {/* Gornji deo: Težina i Naslov */}
            <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-blue-500/10 text-blue-400 
                                   uppercase tracking-[0.2em] border border-blue-500/20">
                        {DificultyTypeToString[dificulty]}
                    </span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight 
                               group-hover:text-blue-400 transition-colors duration-300">
                    {name}
                </h2>
            </div>

            {/* Srednji deo: Detalji (Grid) */}
            <div className="relative z-10 grid grid-cols-2 gap-4 mb-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} className="text-blue-500/70" />
                    <span className="text-xs font-bold">{durationInWeeks} nedelja</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <BarChart size={16} className="text-emerald-500/70" />
                    <span className="text-xs font-bold">{DificultyTypeToString[dificulty]}</span>
                </div>
            </div>

            {/* Donji deo: Autor i Dugme */}
            <div className="relative z-10 mt-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 
                                    flex items-center justify-center border border-white/10 shadow-inner">
                        <User size={18} className="text-gray-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Instruktor</span>
                        <span className="text-xs font-bold text-gray-300 hover:text-white transition-colors">
                            {authorName} {authorSurname}
                        </span>
                    </div>
                </div>

                <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-600 transition-all duration-500 
                                group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform duration-500" />
                </div>
            </div>
        </div>
    );
}

export default CourseCard;