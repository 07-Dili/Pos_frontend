export enum UserRole {
    SUPERVISOR = 'SUPERVISOR',
    OPERATOR = 'OPERATOR',
}

export interface User {
    id: number;
    email: string;
    role: UserRole;
}

export interface UserFormData {
    email: string;
    password: string;
}

export interface AuthResponse {
    id: number;
    email: string;
    role: UserRole;
}
