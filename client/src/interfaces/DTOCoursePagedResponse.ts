import type { DTOCourseResponse } from "./DTOCourseResponse";

export interface DTOCoursePagedResponse {
    items: DTOCourseResponse[];
    totalCount: number;
}