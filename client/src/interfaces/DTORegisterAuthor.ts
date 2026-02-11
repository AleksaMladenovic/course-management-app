export interface DTORegisterAuthor {
    FirebaseUid: string;
    Name: string;
    Surname: string;
    Email: string;
    Telephone: string;
    DateOfBirth: string; // ISO date string (was DateTime in C#)
}