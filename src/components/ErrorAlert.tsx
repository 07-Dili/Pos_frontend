'use client';

import React from 'react';

interface ErrorAlertProps {
    message: string;
    onClose?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onClose }) => {
    return (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <strong>Error!</strong> {message}
            {onClose && (
                <button
                    type="button"
                    className="btn-close"
                    onClick={onClose}
                    aria-label="Close"
                />
            )}
        </div>
    );
};

export default ErrorAlert;
