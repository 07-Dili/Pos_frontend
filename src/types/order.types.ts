export enum OrderStatus {
    CREATED = 'CREATED',
    INVOICED = 'INVOICED',
}

export interface OrderItem {
    barcode: string;
    quantity: number;
    sellingPrice: number;
}

export interface Order {
    id: number;
    status: OrderStatus;
    totalAmount: number;
    createdAt: string;
    items: OrderItem[];
}
