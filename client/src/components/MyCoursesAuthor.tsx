import { useEffect, useState } from "react";
import Pagination from "./Pagination";
import AddCourseCard from "./AddCourseCard";
import type { DTOCourseResponse } from "../interfaces/DTOCourseResponse";
import api from "../axios";
import { getAuth } from "firebase/auth";
import CourseCard from "./CourseCard";

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
        isLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        ) : (
            <div className="p-6">
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pretraži kurseve..." className="mb-4 p-2 border border-gray-300 rounded w-full" />
                {allCourses.length === 0 ? (
                    <p className="text-gray-500">Nemate kreiranih kurseva.</p>
                ) : filteredCourses.length === 0 && (
                    <p className="text-gray-500">Nema kurseva koji odgovaraju pretrazi.</p>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <AddCourseCard />
                    {(
                        coursesForCurrentPage.map(course => (
                            <CourseCard authorId={course.author.authorFirebaseId} authorName={course.author.name} authorSurname={course.author.surname} dificulty={course.difficulty} durationInWeeks={course.durationInWeeks} id={course.id} name={course.name} key={course.id} />
                        ))
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        )
    )
}

export default MyCoursesAuthor;