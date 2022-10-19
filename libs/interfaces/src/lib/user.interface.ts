export enum UserRole {
    Teacher = 'Teacher',
    Student = 'Student',
}

export enum PurchaseState {
    Started='Started',
    WatingForPayment = 'WaitingForPayment',
    Purchased = 'Purchased',
    Canceled = 'Canceled' 
}

export interface User {
    _id?: string;
    displayName?: string;
    email: string;
    passwordHash: string;
    role: UserRole;
    courses?: UserCourses[]; 
}

export interface UserCourses {
    courseId: string;
    purchaseState: PurchaseState;
}