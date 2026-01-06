'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from '@/components/ToastContainer';
import { UserFormData, UserRole } from '@/types/user.types';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const [submitting, setSubmitting] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();

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
            await authService.signup(formData);
            showSuccess('Signup successful! Please login.');
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (error: any) {
            showError(error.response?.data?.message || 'Signup failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (field: keyof UserFormData, value: string) => {
        setFormData({ ...formData, [field]: value });
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <div className="card shadow-lg" style={{ width: '100%', maxWidth: '450px' }}>
                <div className="card-header bg-primary text-white text-center py-3">
                    <h4 className="mb-0">Sign Up</h4>
                </div>
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
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

                        <button
                            type="submit"
                            className="btn btn-primary w-100 mb-3"
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

                        <div className="text-center">
                            <p className="mb-0">
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className="btn btn-link p-0"
                                    onClick={() => router.push('/login')}
                                >
                                    Login
                                </button>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
