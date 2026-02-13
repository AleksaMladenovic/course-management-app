import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { DTOCourseWithLessons } from "../interfaces/DTOCourseWithLessons";
import api from "../axios";
import { DificultyTypeToString } from "../enums/DificultyType";
import { getAuth } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

const CourseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [course, setCourse] = useState<DTOCourseWithLessons>();
    const auth = getAuth();
    const {user} = useAuth();
    user?.role
    auth.currentUser?.uid 
    useEffect(() => {
        const fetchCourse = async () => {
            // Ovde bi išao API poziv da se dobiju detalji kursa po ID-ju
            const result:DTOCourseWithLessons = (await api.get(`/Course/getById/${id}`)).data
            console.log("Detalji kursa:", result);
            setCourse(result);
        };
        fetchCourse();
    }, [id]);



    return (
        <div className="max-w-2xl mx-auto mt-8 p-6 rounded shadow">
            <h1 className="text-3xl font-bold mb-4">{course?.name}</h1>
            <div className="mb-4">
                <p className="mb-2"><strong>Opis:</strong> {course?.description}</p>
                <p className="mb-2"><strong>Trajanje:</strong> {course?.durationInWeeks} nedelja</p>
                <p className="mb-2"><strong>Težina:</strong> {course ? DificultyTypeToString[course.difficulty] : ""}</p>
                <p className="mb-2"><strong>Autor:</strong> {course?.author?.name} {course?.author?.surname}</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Lekcije</h2>
                {course?.lessons && course.lessons.length > 0 ? (
                    <table className="w-full border border-gray-300 rounded">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-3 text-left">Naziv</th>
                                <th className="py-2 px-3 text-left">Opis</th>
                                <th className="py-2 px-3 text-left">Trajanje (min)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.lessons.map(lesson => (
                                <tr key={lesson.id} className="border-t">
                                    <td className="py-2 px-3 font-medium">{lesson.name}</td>
                                    <td className="py-2 px-3">{lesson.description}</td>
                                    <td className="py-2 px-3">{lesson.durationInMinutes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">Ovaj kurs nema lekcija.</p>
                )}
            </div>
        </div>
    );
}

export default CourseDetailsPage;