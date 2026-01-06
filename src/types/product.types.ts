export interface Product {
    id: number;
    clientId: number;
    name: string;
    barcode: string;
    mrp: number;
}

export interface ProductFormData {
    clientId: number;
    name: string;
    barcode: string;
    mrp: number;
}
