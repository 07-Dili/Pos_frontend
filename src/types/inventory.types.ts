export interface Inventory {
    id?: number;
    productId: number;
    clientId: number;
    productName: string;
    barcode: string;
    mrp: number;
    quantity: number;
}

export interface InventoryFormData {
    productId: number;
    quantity: number;
}
