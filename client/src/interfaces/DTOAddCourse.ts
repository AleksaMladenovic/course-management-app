import type { DificultyType } from "../enums/DificultyType";

export interface DTOAddCourse {
    name: string;
    durationInWeeks: number;
    description: string;
    difficulty: DificultyType;
    authorFirebaseId: string;
}