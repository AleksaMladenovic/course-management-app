
import { useEffect, useState } from "react";
import Pagination from "./Pagination";
import type { DTOCourseResponse } from "../interfaces/DTOCourseResponse";
import api from "../axios";
import { getAuth } from "firebase/auth";
import CourseCard from "./CourseCard";

const PAGE_SIZE = 8;

const MyCoursesStudent = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [allCourses, setAllCourses] = useState<DTOCourseResponse[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<DTOCourseResponse[]>([]);
    const [coursesForCurrentPage, setCoursesForCurrentPage] = useState<DTOCourseResponse[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const studentFirebaseUid = getAuth().currentUser?.uid;
    const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);

    useEffect(() => {
        setIsLoading(true);
        api.get(`/Student/${studentFirebaseUid}/courses`).then(res => {
            setAllCourses(res.data);
            setIsLoading(false);
        }).catch(err => {
            console.error("Greška pri dobijanju kurseva studenta:", err);
            setIsLoading(false);
        });
    }, [studentFirebaseUid]);

    useEffect(() => {
        const filtered = allCourses.filter(course =>
            course.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCourses(filtered);
    }, [searchTerm, allCourses]);

    useEffect(() => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        setCoursesForCurrentPage(filteredCourses.slice(startIndex, endIndex));
    }, [currentPage, filteredCourses]);

    return (
        isLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
            </div>
        ) : (
            <div className="p-6">
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pretraži kurseve..." className="mb-4 p-2 border border-gray-300 rounded w-full" />
                { allCourses.length === 0 ? (
                    <p className="text-gray-500">Nemate upisane kurseve.</p>
                ) : filteredCourses.length === 0 && (
                    <p className="text-gray-500">Nema kurseva koji odgovaraju pretrazi.</p>
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {(
                        coursesForCurrentPage.map(course => (
                            <CourseCard authorId={course.author.authorFirebaseId} authorName={course.author.name} authorSurname={course.author.surname} dificulty={course.difficulty} durationInWeeks={course.durationInWeeks} id={course.id} name={course.name} key={course.id} />
                        ))
                    )}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        )
    );
}

export default MyCoursesStudent;