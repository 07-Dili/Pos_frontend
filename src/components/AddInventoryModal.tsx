'use client';

import React, { useState, useEffect } from 'react';
import { InventoryFormData, Inventory } from '@/types/inventory.types';
import { Product } from '@/types/product.types';
import productService from '@/services/productService';
import inventoryService from '@/services/inventoryService';

interface AddInventoryModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (inventory: InventoryFormData) => Promise<void>;
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({ show, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<InventoryFormData>({
        productId: 0,
        quantity: 0,
    });
    const [products, setProducts] = useState<Product[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof InventoryFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    useEffect(() => {
        if (show) {
            fetchProductsAndInventory();
        }
    }, [show]);

    const fetchProductsAndInventory = async () => {
        try {
            setLoadingProducts(true);
            const allProducts = await productService.getAll(0, 1000);

            const existingInventory = await inventoryService.getAll(0, 1000);

            const inventoryProductIds = new Set(existingInventory.map((inv: Inventory) => inv.productId));

            const available = allProducts.filter((product: Product) => !inventoryProductIds.has(product.id));

            setProducts(allProducts);
            setAvailableProducts(available);
        } catch (error) {
            console.error('Failed to fetch products');
        } finally {
            setLoadingProducts(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof InventoryFormData, string>> = {};

        if (!formData.productId || formData.productId === 0) {
            newErrors.productId = 'Product is required';
        }

        if (formData.quantity < 0) {
            newErrors.quantity = 'Quantity cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(formData);
            handleClose();
        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({ productId: 0, quantity: 0 });
        setErrors({});
        setSubmitting(false);
        onClose();
    };

    const handleChange = (field: keyof InventoryFormData, value: number) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Add Inventory</h5>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                onClick={handleClose}
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="inventoryProduct" className="form-label">
                                        Product <span className="text-danger">*</span>
                                    </label>
                                    {loadingProducts ? (
                                        <div className="text-muted">Loading products...</div>
                                    ) : availableProducts.length === 0 ? (
                                        <div className="alert alert-info">
                                            All products already have inventory entries. No products available to add.
                                        </div>
                                    ) : (
                                        <select
                                            className={`form-select ${errors.productId ? 'is-invalid' : ''}`}
                                            id="inventoryProduct"
                                            value={formData.productId}
                                            onChange={(e) => handleChange('productId', parseInt(e.target.value))}
                                        >
                                            <option value={0}>Select a product</option>
                                            {availableProducts.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} ({product.barcode})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {errors.productId && <div className="invalid-feedback">{errors.productId}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="inventoryQuantity" className="form-label">
                                        Quantity <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                        id="inventoryQuantity"
                                        value={formData.quantity || ''}
                                        onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                                        placeholder="Enter quantity"
                                        min="0"
                                    />
                                    {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting || loadingProducts}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Inventory'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddInventoryModal;
