'use client';

import React, { useState, useEffect } from 'react';
import { ProductFormData } from '@/types/product.types';
import { Client } from '@/types/client.types';
import clientService from '@/services/clientService';

interface AddProductModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (product: ProductFormData) => Promise<void>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({ show, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<ProductFormData>({
        clientId: 0,
        name: '',
        barcode: '',
        mrp: 0,
    });
    const [clients, setClients] = useState<Client[]>([]);
    const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (show) {
            fetchClients();
        }
    }, [show]);

    const fetchClients = async () => {
        try {
            const response = await clientService.getAll(0, 100);
            setClients(response);
        } catch (error) {
            console.error('Failed to fetch clients');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ProductFormData, string>> = {};

        if (!formData.clientId || formData.clientId === 0) {
            newErrors.clientId = 'Client is required';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        }

        if (!formData.barcode.trim()) {
            newErrors.barcode = 'Barcode is required';
        } else if (formData.barcode.length > 10) {
            newErrors.barcode = 'Barcode must be max 10 characters';
        }

        if (!formData.mrp || formData.mrp <= 0) {
            newErrors.mrp = 'MRP must be greater than 0';
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
        setFormData({ clientId: 0, name: '', barcode: '', mrp: 0 });
        setErrors({});
        setSubmitting(false);
        onClose();
    };

    const handleChange = (field: keyof ProductFormData, value: string | number) => {
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
                            <h5 className="modal-title">Add New Product</h5>
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
                                    <label htmlFor="productClient" className="form-label">
                                        Client <span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className={`form-select ${errors.clientId ? 'is-invalid' : ''}`}
                                        id="productClient"
                                        value={formData.clientId}
                                        onChange={(e) => handleChange('clientId', parseInt(e.target.value))}
                                    >
                                        <option value={0}>Select a client</option>
                                        {clients.map((client) => (
                                            <option key={client.id} value={client.id}>
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.clientId && <div className="invalid-feedback">{errors.clientId}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="productName" className="form-label">
                                        Product Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        id="productName"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Enter product name"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="productBarcode" className="form-label">
                                        Barcode <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.barcode ? 'is-invalid' : ''}`}
                                        id="productBarcode"
                                        value={formData.barcode}
                                        onChange={(e) => handleChange('barcode', e.target.value)}
                                        placeholder="Enter barcode (max 10 characters)"
                                        maxLength={10}
                                    />
                                    {errors.barcode && <div className="invalid-feedback">{errors.barcode}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="productMrp" className="form-label">
                                        MRP <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className={`form-control ${errors.mrp ? 'is-invalid' : ''}`}
                                        id="productMrp"
                                        value={formData.mrp || ''}
                                        onChange={(e) => handleChange('mrp', parseFloat(e.target.value) || 0)}
                                        placeholder="Enter MRP"
                                    />
                                    {errors.mrp && <div className="invalid-feedback">{errors.mrp}</div>}
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
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Adding...
                                        </>
                                    ) : (
                                        'Add Product'
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

export default AddProductModal;
