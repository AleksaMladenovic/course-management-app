import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DTOCourseWithLessons } from "../interfaces/DTOCourseWithLessons";
import api from "../axios";
import { DificultyTypeToString } from "../enums/DificultyType";

const CourseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<DTOCourseWithLessons>();

    useEffect(() => {
        const fetchCourse = async () => {
            // Ovde bi išao API poziv da se dobiju detalji kursa po ID-ju
            const result:DTOCourseWithLessons = (await api.get(`/Course/getById/${id}`)).data
            console.log("Detalji kursa:", result);
            setCourse(result);
        };
        fetchCourse();
    }, [id]);



    return <div>
        <h1 className="text-3xl font-bold mb-4">{course?.name}</h1>
        <p className="mb-2"><strong>Opis:</strong> {course?.description}</p>
        <p className="mb-2"><strong>Trajanje:</strong> {course?.durationInWeeks} nedelja</p>
        <p className="mb-4"><strong>Težina:</strong> {course ? DificultyTypeToString[course.difficulty] : ""}</p>
    </div>
}

export default CourseDetailsPage;