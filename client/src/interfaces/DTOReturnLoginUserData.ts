import type { RoleType } from "../enums/RoleType";

export interface DTOReturnLoginUserData {
  name: string;
  surname: string;
  email: string;
  telephone: string;
  dateOfBirth: string; // ISO string (DateTime na backendu)
  role: RoleType;
}