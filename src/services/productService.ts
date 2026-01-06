import apiService from './apiService';
import { Product, ProductFormData } from '@/types/product.types';
import { PaginatedResponse } from '@/types/api.types';

class ProductService {
    private readonly BASE_PATH = '/products';

    async getAll(page: number = 0, size: number = 10): Promise<Product[]> {
        return apiService.get<Product[]>(
            `${this.BASE_PATH}?page=${page}&size=${size}`
        );
    }

    async getById(id: number): Promise<Product> {
        return apiService.get<Product>(`${this.BASE_PATH}/${id}`);
    }

    async create(product: ProductFormData): Promise<Product> {
        return apiService.post<Product>(this.BASE_PATH, product);
    }

    async update(id: number, product: Partial<ProductFormData>): Promise<Product> {
        return apiService.put<Product>(`${this.BASE_PATH}/${id}`, product);
    }

    async search(searchTerm: string, searchField: string = 'name'): Promise<Product[]> {
        return apiService.get<Product[]>(`${this.BASE_PATH}/search?${searchField}=${searchTerm}`);
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

export default new ProductService();
