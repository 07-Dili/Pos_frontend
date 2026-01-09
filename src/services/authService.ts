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

    async logout(): Promise<void> {
        try {
            await apiService.post(`${this.BASE_PATH}/logout`, {});
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

export default new AuthService();
