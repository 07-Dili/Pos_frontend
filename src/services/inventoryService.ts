import apiService from './apiService';
import { Inventory, InventoryFormData } from '@/types/inventory.types';

class InventoryService {
    private readonly BASE_PATH = '/inventory';

    async getAll(page: number = 0, size: number = 10): Promise<Inventory[]> {
        return apiService.get<Inventory[]>(
            `${this.BASE_PATH}?page=${page}&size=${size}`
        );
    }

    async getById(id: number): Promise<Inventory> {
        return apiService.get<Inventory>(`${this.BASE_PATH}/${id}`);
    }

    async create(inventory: InventoryFormData): Promise<Inventory> {
        return apiService.post<Inventory>(this.BASE_PATH, inventory);
    }

    async update(inventory: InventoryFormData): Promise<Inventory> {
        return apiService.put<Inventory>(this.BASE_PATH, inventory);
    }

    async filter(searchTerm: string, searchField: string = 'name'): Promise<Inventory[]> {
        return apiService.get<Inventory[]>(`${this.BASE_PATH}/filter?${searchField}=${searchTerm}`);
    }

    async upload(file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);
        return apiService.post<void>(`${this.BASE_PATH}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
}

export default new InventoryService();
