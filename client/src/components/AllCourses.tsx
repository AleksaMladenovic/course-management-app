import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
import CourseCard from "./CourseCard";
import AllCoursesFilter, { type AllCoursesFilterProps } from "./AllCoursesFilter";
import api from "../axios";
import type { DTOCoursePagedResponse } from "../interfaces/DTOCoursePagedResponse";
import type { DTOCourseResponse } from "../interfaces/DTOCourseResponse";
import AddCourseCard from "./AddCourseCard";


interface CourseFilterWithPaginationProps extends AllCoursesFilterProps {
    pageNumber: number;
    pageSize: number;
}


const totalCoursesOnPage = 4;

const AllCourses = () => {
    const [courses, setCourses] = useState<DTOCourseResponse[]>();
    const [totalCourses, setTotalCourses] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = Number(searchParams.get("page")) || 1;

    const totalPages = Math.ceil(totalCourses / totalCoursesOnPage);

    useEffect(() => {
        const fetchData = async () => {
            const filter: CourseFilterWithPaginationProps = {
                name: searchParams.get("name") || "",
                difficulty: searchParams.get("difficulty") ? Number(searchParams.get("difficulty")) as any : undefined,
                minDurationInWeeks: searchParams.get("minDurationInWeeks") ? Number(searchParams.get("minDurationInWeeks")) : undefined,
                maxDurationInWeeks: searchParams.get("maxDurationInWeeks") ? Number(searchParams.get("maxDurationInWeeks")) : undefined,
                sort: searchParams.get("sort") ? Number(searchParams.get("sort")) as any : undefined,
                pageNumber: currentPage,
                pageSize: totalCoursesOnPage,
            } as CourseFilterWithPaginationProps;
            console.log("Filter za API poziv:", filter);
            const response: DTOCoursePagedResponse = await (await api.get("Course/getCoursesByFilter", { params: filter })).data;
            setTotalCourses(response.totalCount);
            setCourses(response.items);
        };
        fetchData();
    }, [searchParams]);

    // Kada korisnik primeni filter
    const onApplyFilter = (props: AllCoursesFilterProps) => {
        const params: any = {
            ...props,
            page: 1, // resetuj na prvu stranicu kad se filter menja
        };
        // Ukloni prazne vrednosti
        Object.keys(params).forEach((key) => {
            if (params[key] === "" || params[key] === undefined) {
                delete params[key];
            }
        });
        setSearchParams(params);
    };

    // Kada korisnik promeni stranicu
    const handlePageChange = (page: number) => {
        const params: any = Object.fromEntries(searchParams.entries());
        params.page = page;
        setSearchParams(params);
    };

    return (
        
        <div className="">
            <AllCoursesFilter onApplyFilter={onApplyFilter} />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {courses?.map((course) => (
                    <CourseCard
                        key={course.id}
                        id={course.id}
                        authorId={course.author.authorFirebaseId}
                        authorName={course.author.name}
                        authorSurname={course.author.surname}
                        dificulty={course.difficulty}
                        name={course.name}
                        durationInWeeks={course.durationInWeeks}
                    >
                    </CourseCard>
                ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
}

export default AllCourses;