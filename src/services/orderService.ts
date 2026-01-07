import apiService from './apiService';
import { Order } from '@/types/order.types';

class OrderService {
    private readonly BASE_PATH = '/orders';
    private readonly INVOICE_PATH = '/invoices';

    async getAll(page: number = 0, size: number = 10): Promise<Order[]> {
        const response = await apiService.get<any>(
            `${this.BASE_PATH}?page=${page}&size=${size}`
        );
        return response.content || response;
    }

    async getById(id: number): Promise<Order> {
        return apiService.get<Order>(`${this.BASE_PATH}/${id}`);
    }

    async getByDateRange(from: string, to: string, page: number = 0, size: number = 10): Promise<Order[]> {
        const response = await apiService.get<any>(
            `${this.BASE_PATH}/by-date?from=${from}&to=${to}&page=${page}&size=${size}`
        );
        return response.content || response;
    }

    async getByStatus(status: string, page: number = 0, size: number = 10): Promise<Order[]> {
        const response = await apiService.get<any>(
            `${this.BASE_PATH}/status?status=${status}&page=${page}&size=${size}`
        );
        return response.content || response;
    }

    async create(orderData: any): Promise<Order> {
        return apiService.post<Order>(this.BASE_PATH, orderData);
    }



    async generateInvoice(orderId: number): Promise<any> {
        return apiService.post<any>(`${this.INVOICE_PATH}/generate/${orderId}`, {});
    }

    async downloadInvoice(orderId: number): Promise<Blob> {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}${this.INVOICE_PATH}/${orderId}/download`,
        {
            method: 'GET',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/pdf',
            },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to download invoice');
    }

    return response.blob();
}

}

export default new OrderService();
