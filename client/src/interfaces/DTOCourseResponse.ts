import type { DificultyType } from "../enums/DificultyType";
import type { DTOCourseAuthor } from "./DTOCourseAuthor";

export interface DTOCourseResponse {
    id: string;
    name: string;
    durationInWeeks: number;
    description: string;
    difficulty: DificultyType;
    author: DTOCourseAuthor;
}