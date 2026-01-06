import apiService from './apiService';
import { Client, ClientFormData } from '@/types/client.types';
import { PaginatedResponse } from '@/types/api.types';

class ClientService {
    private readonly BASE_PATH = '/clients';

    async getAll(page: number = 0, size: number = 10): Promise<Client[]> {
        return apiService.get<Client[]>(
            `${this.BASE_PATH}?page=${page}&size=${size}`
        );
    }

    async getById(id: number): Promise<Client> {
        return apiService.get<Client>(`${this.BASE_PATH}/${id}`);
    }

    async create(client: ClientFormData): Promise<Client> {
        return apiService.post<Client>(this.BASE_PATH, client);
    }

    async update(id: number, client: Partial<ClientFormData>): Promise<Client> {
        return apiService.put<Client>(`${this.BASE_PATH}/${id}`, client);
    }

    async search(searchTerm: string, searchField: string = 'name'): Promise<Client[]> {
        return apiService.get<Client[]>(`${this.BASE_PATH}/search?${searchField}=${searchTerm}`);
    }
}

export default new ClientService();
