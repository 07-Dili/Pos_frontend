'use client';

import React, { useState, useRef } from 'react';

interface UploadInventoryModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (file: File) => Promise<void>;
}

const UploadInventoryModal: React.FC<UploadInventoryModalProps> = ({ show, onClose, onSubmit }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.tsv') && !file.name.endsWith('.txt')) {
                setError('Please select a TSV file (.tsv or .txt)');
                setSelectedFile(null);
                return;
            }
            setError('');
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError('Please select a file');
            return;
        }

        setUploading(true);
        try {
            await onSubmit(selectedFile);
            handleClose();
        } catch (error) {
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setError('');
        setUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onClose();
    };

    if (!show) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={handleClose}></div>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Upload Inventory (TSV)</h5>
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
                                    <label htmlFor="fileUpload" className="form-label">
                                        Select TSV File <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                        id="fileUpload"
                                        accept=".tsv,.txt"
                                        onChange={handleFileChange}
                                    />
                                    {error && <div className="invalid-feedback">{error}</div>}
                                    {selectedFile && !error && (
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
                                                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                            </small>
                                        </div>
                                    )}
                                </div>
                                <div className="alert alert-info">
                                    <small>
                                        <strong>Note:</strong> The TSV file should contain inventory data with proper formatting.
                                        Make sure the file follows the required structure.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={uploading || !selectedFile}
                                >
                                    {uploading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
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

export default UploadInventoryModal;
