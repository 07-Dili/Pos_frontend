export interface ApiResponse<T> {
    data: T;
    message?: string;
    status?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface ErrorResponse {
    message: string;
    status: number;
    timestamp: string;
    errors?: Record<string, string>;
}
