import { useEffect, useState } from "react";
import Pagination from "./Pagination";
import AddCourseCard from "./AddCourseCard";
import type { DTOCourseResponse } from "../interfaces/DTOCourseResponse";
import api from "../axios";
import { getAuth } from "firebase/auth";
import CourseCard from "./CourseCard";
import { Search, BookOpen, Loader2, Plus } from "lucide-react";

const MyCoursesAuthor = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [allCourses, setAllCourses] = useState<DTOCourseResponse[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<DTOCourseResponse[]>([]);
    const [coursesForCurrentPage, setCoursesForCurrentPage] = useState<DTOCourseResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const userFirebaseUid = getAuth().currentUser?.uid;
    const totalPages = Math.ceil(filteredCourses.length / 7);

    useEffect(() => {
        setIsLoading(true);
        setAllCourses([]);
        api.get(`/Author/${userFirebaseUid}/courses`).then(res => {
            setAllCourses(res.data);
            setIsLoading(false);
        }).catch(err => {
            console.error("Greška pri dobijanju kurseva autora:", err);
        })
    }, [userFirebaseUid]);

    useEffect(() => {
        const filtered = allCourses.filter(course =>
                course.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredCourses(filtered);
    }, [searchTerm, allCourses]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * 7;
        const endIndex = startIndex + 7;
        setCoursesForCurrentPage(filteredCourses.slice(startIndex, endIndex));
    }, [currentPage, filteredCourses]);



    console.log("Kursevi autora:", allCourses);
    return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {isLoading ? (
            /* --- MODERAN LOADING STATE --- */
            <div className="flex flex-col items-center justify-center py-40">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px]">
                    Učitavanje vaših kurseva...
                </p>
            </div>
        ) : (
            /* --- GLAVNI SADRŽAJ --- */
            <div className="my-courses-author space-y-12">
                
                {/* HEADER SEKCIJA */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-6 w-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Pretraga</span>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Moji Kursevi</h2>
                    </div>

                    {/* MODERN SEARCH BAR */}
                    <div className="relative group w-full md:w-96">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300">
                            <Search size={18} strokeWidth={2.5} />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pretraži moje kurseve..."
                            className="w-full bg-[#141b2d]/40 backdrop-blur-xl border border-white/5 rounded-2xl py-4 pl-12 pr-6 
                                       text-white placeholder:text-gray-600 outline-none 
                                       focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 
                                       transition-all duration-300 shadow-xl text-sm"
                            name="input-search"
                        />
                    </div>
                </div>

                {/* PROVERA PRAZNOG STANJA */}
                {allCourses.length === 0 ? (
                    <div className="w-full py-24 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner text-gray-600">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="search-result-text text-xl font-black text-white uppercase tracking-tight mb-2">Još niste kreirali nijedan kurs</h3>
                        <p className="text-gray-500 text-sm max-w-xs mx-auto font-light">
                            Započnite svoje putovanje autora tako što ćete kliknuti na dugme ispod.
                        </p>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="w-full py-20 text-center">
                        <Search size={40} className="mx-auto text-gray-700 mb-4 opacity-20" />
                        <p className="search-result-text text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            Nema rezultata za pretragu "{searchTerm}"
                        </p>
                    </div>
                ) : null}

                {/* GRID SA KURSEVIMA */}
                <div className="courses-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                    <div className="transform transition-all hover:-translate-y-2">
                        <AddCourseCard />
                    </div>

                    {coursesForCurrentPage.map((course) => (
                        <div key={course.id} className="transform transition-all duration-300 hover:-translate-y-2">
                            <CourseCard
                                id={course.id}
                                authorId={course.author.authorFirebaseId}
                                authorName={course.author.name}
                                authorSurname={course.author.surname}
                                dificulty={course.difficulty}
                                name={course.name}
                                durationInWeeks={course.durationInWeeks}
                            />
                        </div>
                    ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                    <div className="mt-20 pt-12 border-t border-white/5 flex justify-center">
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                )}
            </div> /* Zatvoren sadržajni div */
        )}
    </div> /* Zatvoren glavni div */
);
}
export default MyCoursesAuthor;