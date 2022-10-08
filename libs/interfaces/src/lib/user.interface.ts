export enum UserRole {
    Teacher = 'Teacher',
    Student = 'Student',
}

export interface User {
    displayName: string;
    email: string;
    passwordHash: string;
    role: UserRole;
}