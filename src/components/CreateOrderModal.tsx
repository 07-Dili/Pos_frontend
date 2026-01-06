'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/product.types';
import productService from '@/services/productService';

interface OrderItem {
    productId: number;
    barcode: string;
    productName: string;
    quantity: number;
    sellingPrice: number;
}

interface CreateOrderModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (items: OrderItem[]) => Promise<void>;
}

const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ show, onClose, onSubmit }) => {
    const [barcodeSearch, setBarcodeSearch] = useState<string>('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [sellingPrice, setSellingPrice] = useState<number>(0);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [errors, setErrors] = useState<{ product?: string; quantity?: string; sellingPrice?: string }>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (show) {
            resetForm();
        }
    }, [show]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (barcodeSearch.trim() && !selectedProduct) {
                searchProductByBarcode(barcodeSearch);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [barcodeSearch]);

    const searchProductByBarcode = async (barcode: string) => {
        if (!barcode.trim()) {
            setSelectedProduct(null);
            setSellingPrice(0);
            setRecommendations([]);
            setShowRecommendations(false);
            return;
        }

        try {
            const results = await productService.search(barcode, 'barcode');
            if (results.length > 0) {
                setRecommendations(results);
                setShowRecommendations(true);
            } else {
                setRecommendations([]);
                setShowRecommendations(false);
            }
        } catch (error) {
            console.error('Failed to search product:', error);
            setRecommendations([]);
            setShowRecommendations(false);
        }
    };

    const selectProduct = (product: Product) => {
        setSelectedProduct(product);
        setBarcodeSearch(product.barcode);
        setSellingPrice(product.mrp);
        setRecommendations([]);
        setShowRecommendations(false);
        if (errors.product) {
            setErrors({ ...errors, product: undefined });
        }
    };

    const resetForm = () => {
        setBarcodeSearch('');
        setSelectedProduct(null);
        setRecommendations([]);
        setShowRecommendations(false);
        setQuantity(1);
        setSellingPrice(0);
        setOrderItems([]);
        setErrors({});
    };

    const validateItem = (): boolean => {
        const newErrors: { product?: string; quantity?: string; sellingPrice?: string } = {};

        if (!selectedProduct) {
            newErrors.product = 'Please search and select a product';
        }

        if (quantity <= 0) {
            newErrors.quantity = 'Quantity must be greater than 0';
        }

        if (sellingPrice <= 0) {
            newErrors.sellingPrice = 'Selling price must be greater than 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddItem = () => {
        if (!validateItem() || !selectedProduct) {
            return;
        }

        const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct.id);

        if (existingItemIndex >= 0) {
            const updatedItems = [...orderItems];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + quantity,
            };
            setOrderItems(updatedItems);
        } else {
            const newItem: OrderItem = {
                productId: selectedProduct.id,
                barcode: selectedProduct.barcode,
                productName: selectedProduct.name,
                quantity,
                sellingPrice,
            };
            setOrderItems([...orderItems, newItem]);
        }

        setBarcodeSearch('');
        setSelectedProduct(null);
        setRecommendations([]);
        setShowRecommendations(false);
        setQuantity(1);
        setSellingPrice(0);
        setErrors({});
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = orderItems.filter((_, i) => i !== index);
        setOrderItems(updatedItems);
    };

    const calculateTotal = (): number => {
        return orderItems.reduce((total, item) => total + (item.quantity * item.sellingPrice), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            setErrors({ product: 'Please add at least one item to the order' });
            return;
        }

        setSubmitting(true);
        try {
            await onSubmit(orderItems);
            handleClose();
        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };



    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show"></div>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-xl modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Create New Order</h5>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-5">
                                        <h6 className="mb-3">Add Item</h6>
                                        <div className="mb-3">
                                            <label htmlFor="barcodeSearch" className="form-label">
                                                Barcode <span className="text-danger">*</span>
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <input
                                                    type="text"
                                                    className={`form-control ${errors.product ? 'is-invalid' : ''}`}
                                                    id="barcodeSearch"
                                                    value={barcodeSearch}
                                                    onChange={(e) => setBarcodeSearch(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (recommendations.length > 0) {
                                                                selectProduct(recommendations[0]);
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Enter or scan barcode"
                                                    autoFocus
                                                />

                                                {showRecommendations && recommendations.length > 0 && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: 0,
                                                            right: 0,
                                                            maxHeight: '200px',
                                                            overflowY: 'auto',
                                                            backgroundColor: 'white',
                                                            border: '1px solid #dee2e6',
                                                            borderRadius: '0.25rem',
                                                            boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                                                            zIndex: 1000,
                                                        }}
                                                    >
                                                        {recommendations.map((product) => (
                                                            <div
                                                                key={product.id}
                                                                onClick={() => selectProduct(product)}
                                                                style={{
                                                                    padding: '0.5rem 1rem',
                                                                    cursor: 'pointer',
                                                                    borderBottom: '1px solid #f0f0f0',
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.backgroundColor = 'white';
                                                                }}
                                                            >
                                                                <div style={{ fontWeight: 500 }}>{product.name}</div>
                                                                <small className="text-muted">
                                                                    {product.barcode} - MRP: ₹{product.mrp}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedProduct && (
                                                <div className="mt-2 text-success">
                                                    <small>
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-check-circle-fill me-1"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                                        </svg>
                                                        {selectedProduct.name} - MRP: ₹{selectedProduct.mrp}
                                                    </small>
                                                </div>
                                            )}
                                            {errors.product && <div className="invalid-feedback">{errors.product}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="orderQuantity" className="form-label">
                                                Quantity <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                                                id="orderQuantity"
                                                value={quantity}
                                                onChange={(e) => {
                                                    setQuantity(parseInt(e.target.value) || 0);
                                                    if (errors.quantity) setErrors({ ...errors, quantity: undefined });
                                                }}
                                                min="1"
                                            />
                                            {errors.quantity && <div className="invalid-feedback">{errors.quantity}</div>}
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor="orderSellingPrice" className="form-label">
                                                Selling Price <span className="text-danger">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className={`form-control ${errors.sellingPrice ? 'is-invalid' : ''}`}
                                                id="orderSellingPrice"
                                                value={sellingPrice}
                                                onChange={(e) => {
                                                    setSellingPrice(parseFloat(e.target.value) || 0);
                                                    if (errors.sellingPrice) setErrors({ ...errors, sellingPrice: undefined });
                                                }}
                                            />
                                            {errors.sellingPrice && <div className="invalid-feedback">{errors.sellingPrice}</div>}
                                        </div>

                                        <button
                                            type="button"
                                            className="btn btn-primary w-100"
                                            onClick={handleAddItem}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-plus-lg me-1"
                                                viewBox="0 0 16 16"
                                            >
                                                <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z" />
                                            </svg>
                                            Add to Order
                                        </button>
                                    </div>

                                    <div className="col-md-7">
                                        <h6 className="mb-3">Order Items ({orderItems.length})</h6>
                                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                            <table className="table table-sm table-striped">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Barcode</th>
                                                        <th>Qty</th>
                                                        <th>Price</th>
                                                        <th>Subtotal</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderItems.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={6} className="text-center text-muted py-3">
                                                                No items added yet
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        orderItems.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.productName}</td>
                                                                <td>{item.barcode}</td>
                                                                <td>{item.quantity}</td>
                                                                <td>₹{item.sellingPrice.toFixed(2)}</td>
                                                                <td>₹{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleRemoveItem(index)}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="14"
                                                                            height="14"
                                                                            fill="currentColor"
                                                                            className="bi bi-trash"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                                                            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                                                        </svg>
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                                {orderItems.length > 0 && (
                                                    <tfoot className="table-light">
                                                        <tr>
                                                            <td colSpan={4} className="text-end"><strong>Total:</strong></td>
                                                            <td colSpan={2}><strong>₹{calculateTotal().toFixed(2)}</strong></td>
                                                        </tr>
                                                    </tfoot>
                                                )}
                                            </table>
                                        </div>
                                    </div>
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
                                    className="btn btn-success"
                                    disabled={submitting || orderItems.length === 0}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Creating Order...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-check-lg me-1"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                            </svg>
                                            Create Order
                                        </>
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

export default CreateOrderModal;
