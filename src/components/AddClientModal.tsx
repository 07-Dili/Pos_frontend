'use client';

import React, { useState } from 'react';
import { ClientFormData } from '@/types/client.types';

interface AddClientModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (client: ClientFormData) => Promise<void>;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ show, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<ClientFormData>({
        name: '',
        email: '',
        phone: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof ClientFormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Client name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits';
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
        setFormData({ name: '', email: '', phone: '' });
        setErrors({});
        setSubmitting(false);
        onClose();
    };

    const handleChange = (field: keyof ClientFormData, value: string) => {
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
                            <h5 className="modal-title">Add New Client</h5>
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
                                    <label htmlFor="clientName" className="form-label">
                                        Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        id="clientName"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="Enter client name"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="clientEmail" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="clientEmail"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="clientPhone" className="form-label">
                                        Phone <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                        id="clientPhone"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength={10}
                                    />
                                    {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
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
                                        'Add Client'
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

export default AddClientModal;
