import type { RoleType } from "../enums/RoleType";

export interface DTOReturnLoginUserData {
  Name: string;
  Surname: string;
  Email: string;
  Telephone: string;
  DateOfBirth: string; // ISO string (DateTime na backendu)
  Role: RoleType;
}