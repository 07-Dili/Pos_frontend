'use client';

import React, { useState } from 'react';
import { UserFormData } from '@/types/user.types';

interface SignupModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (userData: UserFormData) => Promise<void>;
    onSwitchToLogin: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ show, onClose, onSubmit, onSwitchToLogin }) => {
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
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
                            <h5 className="modal-title">Sign Up</h5>
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
                                    <label htmlFor="signupEmail" className="form-label">
                                        Email <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="signupEmail"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="signupPassword" className="form-label">
                                        Password <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        id="signupPassword"
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Enter your password (min 6 characters)"
                                    />
                                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                                </div>

                                <div className="text-center mt-3">
                                    <p className="mb-0">
                                        Already have an account?{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0"
                                            onClick={() => {
                                                handleClose();
                                                onSwitchToLogin();
                                            }}
                                        >
                                            Login
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
                                            Signing up...
                                        </>
                                    ) : (
                                        'Sign Up'
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

export default SignupModal;
