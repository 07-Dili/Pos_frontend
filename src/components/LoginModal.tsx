'use client';

import React, { useState } from 'react';
import { UserFormData } from '@/types/user.types';

interface LoginModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (userData: UserFormData) => Promise<void>;
    onSwitchToSignup: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSubmit, onSwitchToSignup }) => {
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof UserFormData, string>> = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
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
        setFormData({ email: '', password: '' });
        setErrors({});
        setSubmitting(false);
        onClose();
    };

    const handleChange = (field: keyof UserFormData, value: string) => {
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
                            <h5 className="modal-title">Login</h5>
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
                                    <label htmlFor="loginEmail" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="loginEmail"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="loginPassword" className="form-label">
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="loginPassword"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={() => {
                                                handleClose();
                                                onSwitchToSignup();
                                            }}
                                        >
                                            Sign up
                                        </button>
                                    </p>
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
                                            Logging in...
                                        </>
                                    ) : (
                                        'Login'
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

export default LoginModal;
