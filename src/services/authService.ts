import apiService from './apiService';
import { User, UserFormData, AuthResponse } from '@/types/user.types';

class AuthService {
    private readonly BASE_PATH = '/auth';

    async signup(userData: UserFormData): Promise<User> {
        const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/signup`, userData);
        return response;
    }

    async login(userData: UserFormData): Promise<User> {
        const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/login`, userData);
        return response;
    }

    setCurrentUser(user: User): void {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user } }));
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.dispatchEvent(new CustomEvent('authChange', { detail: { user: null } }));
    }

    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }
}

export default new AuthService();
