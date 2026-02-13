import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const AddCourseCard = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/add-course");
    };

    return (
        <div 
            onClick={handleClick}
            className="group relative h-full min-h-[320px] flex flex-col items-center justify-center 
                       bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[2rem] p-8 
                       transition-all duration-500 hover:border-blue-500/50 hover:bg-blue-500/5 
                       cursor-pointer overflow-hidden"
        >
            {/* Dekorativni gradijent u pozadini koji se vidi samo na hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-600/0 to-blue-600/5 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Ikona sa krugom i efektom sijanja */}
                <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center 
                                text-gray-500 group-hover:bg-blue-600 group-hover:text-white 
                                group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] 
                                transition-all duration-500 shadow-inner">
                    <Plus size={32} strokeWidth={2.5} />
                </div>

                <div className="text-center">
                    <h2 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] 
                                   group-hover:text-white transition-colors duration-500">
                        Kreiraj Novi Kurs
                    </h2>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2 
                                  opacity-0 group-hover:opacity-100 transition-all duration-700 
                                  translate-y-2 group-hover:translate-y-0">
                        Podeli svoje znanje
                    </p>
                </div>
            </div>

            {/* Suptilni odsjaj u uglu */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full" />
        </div>
    );
};

export default AddCourseCard;