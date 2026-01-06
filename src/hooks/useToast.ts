import { useState, useCallback } from 'react';
import { Toast } from '@/components/ToastContainer';

let toastId = 0;

export const useToast = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
        const id = toastId++;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const showSuccess = useCallback((message: string) => {
        showToast(message, 'success');
    }, [showToast]);

    const showError = useCallback((message: string) => {
        showToast(message, 'error');
    }, [showToast]);

    const showWarning = useCallback((message: string) => {
        showToast(message, 'warning');
    }, [showToast]);

    const showInfo = useCallback((message: string) => {
        showToast(message, 'info');
    }, [showToast]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast,
    };
};
