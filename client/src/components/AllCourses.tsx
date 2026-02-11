import { useEffect, useState } from "react";
import type { CourseCardProps } from "./CourseCard";
import Pagination from "./Pagination";
import CourseCard from "./CourseCard";
import AllCoursesFilter, { type AllCoursesFilterProps } from "./AllCoursesFilter";

const sviKurseviFake: CourseCardProps[] = [
    {
        name: "Uvod u programiranje",
        durationInWeeks: 6,
        dificulty: 0,
        authorName: "Marko",
        authorSurname: "Marković",
        authorId: 1,
    },
    {
        name: "Napredni JavaScript",
        durationInWeeks: 8,
        dificulty: 2,
        authorName: "Jelena",
        authorSurname: "Jovanović",
        authorId: 2,
    },
    {
        name: "Baze podataka",
        durationInWeeks: 7,
        dificulty: 1,
        authorName: "Ivan",
        authorSurname: "Ilić",
        authorId: 3,
    },
    {
        name: "Web dizajn",
        durationInWeeks: 5,
        dificulty: 0,
        authorName: "Ana",
        authorSurname: "Anić",
        authorId: 4,
    },
    {
        name: "React za početnike",
        durationInWeeks: 6,
        dificulty: 0,
        authorName: "Petar",
        authorSurname: "Petrović",
        authorId: 5,
    },
    {
        name: "Algoritmi i strukture podataka",
        durationInWeeks: 10,
        dificulty: 2,
        authorName: "Milica",
        authorSurname: "Milić",
        authorId: 6,
    },
    {
        name: "Python osnove",
        durationInWeeks: 5,
        dificulty: 0,
        authorName: "Nikola",
        authorSurname: "Nikolić",
        authorId: 7,
    },
    {
        name: "C# za developere",
        durationInWeeks: 8,
        dificulty: 1,
        authorName: "Sara",
        authorSurname: "Sarić",
        authorId: 8,
    },
    {
        name: "Machine Learning",
        durationInWeeks: 12,
        dificulty: 2,
        authorName: "Luka",
        authorSurname: "Lukić",
        authorId: 9,
    },
    {
        name: "Frontend osnove",
        durationInWeeks: 4,
        dificulty: 0,
        authorName: "Ivana",
        authorSurname: "Ivanović",
        authorId: 10,
    },
    {
        name: "DevOps principi",
        durationInWeeks: 7,
        dificulty: 1,
        authorName: "Miloš",
        authorSurname: "Milošević",
        authorId: 11,
    },
    {
        name: "Mobilne aplikacije",
        durationInWeeks: 9,
        dificulty: 1,
        authorName: "Tamara",
        authorSurname: "Tamić",
        authorId: 12,
    },
];

const AllCourses = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [courses, setCourses] = useState<CourseCardProps[]>();
    const totalCoursesOnPage = 8;
    const totalPages = Math.ceil(sviKurseviFake.length / totalCoursesOnPage);

    useEffect(() => {
        const startIndex = (currentPage-1) * totalCoursesOnPage;
        const endIndex = startIndex + totalCoursesOnPage;
        setCourses(sviKurseviFake.slice(startIndex, endIndex));
    }, [currentPage]);
    
    return (
        <div className="">       
            <AllCoursesFilter onApplyFilter={(props: AllCoursesFilterProps) => {
                console.log("Primeni filtere sa sledećim opcijama:", props);
                // Handle filter changes here
            }} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {courses?.map((course, index) => (
                    <CourseCard key={index} {...course}></CourseCard>
                ))}
            </div>   
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={function (page: number): void {
                setCurrentPage(page);
            } }/>
        </div>
    )
}

export default AllCourses;