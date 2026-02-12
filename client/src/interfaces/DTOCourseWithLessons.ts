import type { DTOLessonResponse } from "./DTOLessonResponse";
import type { DTOCourseResponse } from "./DTOCourseResponse";

export interface DTOCourseWithLessons extends DTOCourseResponse {
    lessons: DTOLessonResponse[];
}