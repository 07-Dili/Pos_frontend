'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'primary'
}) => {
    const sizeClass = size === 'sm' ? 'spinner-border-sm' : '';

    return (
        <div className="d-flex justify-content-center align-items-center p-3">
            <div className={`spinner-border text-${variant} ${sizeClass}`} role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default LoadingSpinner;
