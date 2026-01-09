'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ToastContainer from '@/components/ToastContainer';
import AddProductModal from '@/components/AddProductModal';
import UploadProductModal from '@/components/UploadProductModal';
import { useToast } from '@/hooks/useToast';
import productService from '@/services/productService';
import authService from '@/services/authService';
import { Product, ProductFormData } from '@/types/product.types';
import { UserRole } from '@/types/user.types';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Product>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState<'name' | 'barcode' | 'clientId'>('name');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();

    const pageSize = 10;

    const fetchProducts = useCallback(async (page: number) => {
        try {
            setLoading(true);
            const response = await productService.getAll(page, pageSize);
            setProducts(response);
            if (response.length < pageSize) {
                setTotalPages(page + 1);
            } else {
                setTotalPages(page + 2);
            }
            setTotalElements(response.length);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [pageSize, showError]);

    useEffect(() => {
        fetchProducts(currentPage);
    }, [currentPage, fetchProducts]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchTerm.trim()) {
                performSearch();
            } else {
                fetchProducts(0);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, searchField]);

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        setEditForm({ ...product });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editForm.name || !editForm.barcode || !editForm.mrp || !editForm.clientId) {
            showError('Please fill in all required fields');
            return;
        }

        try {
            await productService.update(editingId, {
                clientId: editForm.clientId,
                name: editForm.name,
                barcode: editForm.barcode,
                mrp: editForm.mrp,
            });
            await fetchProducts(currentPage);
            setEditingId(null);
            setEditForm({});
            showSuccess('Product updated successfully!');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to update product');
        }
    };

    const handleInputChange = (field: keyof Product, value: string | number) => {
        setEditForm({ ...editForm, [field]: value });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const performSearch = async () => {
        try {
            setLoading(true);
            const results = await productService.search(searchTerm, searchField);
            setProducts(results);
            setTotalPages(1);
            setTotalElements(results.length);
            setCurrentPage(0);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            performSearch();
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        fetchProducts(0);
    };

    const handleAddProduct = async (productData: ProductFormData) => {
        try {
            await productService.create(productData);
            await fetchProducts(currentPage);
            showSuccess('Product added successfully!');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to add product');
            throw err;
        }
    };

    const handleUploadFile = async (file: File) => {
        try {
            await productService.upload(file);
            await fetchProducts(currentPage);
            showSuccess('Products uploaded successfully!');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to upload file');
            throw err;
        }
    };

    return (
        <>
            <Navbar />
            <ToastContainer toasts={toasts} onRemove={removeToast} />

            {loading && products.length === 0 ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    <AddProductModal
                        show={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onSubmit={handleAddProduct}
                    />
                    <UploadProductModal
                        show={showUploadModal}
                        onClose={() => setShowUploadModal(false)}
                        onSubmit={handleUploadFile}
                    />
                    <div className="container mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <form onSubmit={handleSearch} className="d-flex gap-2" style={{ flex: 1, maxWidth: '600px' }}>
                                <select
                                    className="form-select"
                                    style={{ maxWidth: '140px' }}
                                    value={searchField}
                                    onChange={(e) => setSearchField(e.target.value as 'name' | 'barcode' | 'clientId')}
                                >
                                    <option value="name">Name</option>
                                    <option value="barcode">Barcode</option>
                                    <option value="clientId">Client ID</option>
                                </select>
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder={`Search products by ${searchField}...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleClearSearch}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-x-lg"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button type="submit" className="btn btn-primary">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            fill="currentColor"
                                            className="bi bi-search"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-success"
                                    onClick={() => setShowUploadModal(true)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="currentColor"
                                        className="bi bi-upload me-1"
                                        viewBox="0 0 16 16"
                                    >
                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z" />
                                    </svg>
                                    Upload
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowAddModal(true)}
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
                                    Add Product
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-primary">
                                            <tr>
                                                <th className="text-center" style={{ width: '5%' }}>ID</th>
                                                <th className="text-center" style={{ width: '10%' }}>Client ID</th>
                                                <th className="text-center" style={{ width: '30%' }}>Name</th>
                                                <th className="text-center" style={{ width: '15%' }}>Barcode</th>
                                                <th className="text-center" style={{ width: '12%' }}>MRP</th>
                                                <th className="text-center" style={{ width: '18%' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="text-center text-muted py-4">
                                                        No products found
                                                    </td>
                                                </tr>
                                            ) : (
                                                products.map((product) => (
                                                    <tr key={product.id}>
                                                        <td className="text-center">{product.id}</td>
                                                        <td className="text-center">
                                                            {editingId === product.id ? (
                                                                <input
                                                                    type="number"
                                                                    className="form-control form-control-sm text-center"
                                                                    value={editForm.clientId || ''}
                                                                    onChange={(e) => handleInputChange('clientId', parseInt(e.target.value) || 0)}
                                                                />
                                                            ) : (
                                                                product.clientId
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {editingId === product.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm text-center"
                                                                    value={editForm.name || ''}
                                                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                                                />
                                                            ) : (
                                                                product.name
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {editingId === product.id ? (
                                                                <input
                                                                    type="text"
                                                                    className="form-control form-control-sm text-center"
                                                                    value={editForm.barcode || ''}
                                                                    onChange={(e) => handleInputChange('barcode', e.target.value)}
                                                                    maxLength={10}
                                                                />
                                                            ) : (
                                                                product.barcode
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {editingId === product.id ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control form-control-sm text-center"
                                                                    value={editForm.mrp || ''}
                                                                    onChange={(e) => handleInputChange('mrp', parseFloat(e.target.value) || 0)}
                                                                />
                                                            ) : (
                                                                `₹${product.mrp.toFixed(2)}`
                                                            )}
                                                        </td>
                                                        <td className="text-center">
                                                            {editingId === product.id ? (
                                                                <div className="btn-group btn-group-sm">
                                                                    <button
                                                                        className="btn btn-success"
                                                                        onClick={handleSaveEdit}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            fill="currentColor"
                                                                            className="bi bi-check-lg"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
                                                                        </svg>
                                                                        {' '}Save
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-secondary"
                                                                        onClick={handleCancelEdit}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            fill="currentColor"
                                                                            className="bi bi-x-lg"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
                                                                        </svg>
                                                                        {' '}Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => handleEdit(product)}
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        fill="currentColor"
                                                                        className="bi bi-pencil"
                                                                        viewBox="0 0 16 16"
                                                                    >
                                                                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                                                    </svg>
                                                                    {' '}Edit
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {totalPages > 1 && (
                                    <nav aria-label="Page navigation">
                                        <ul className="pagination justify-content-center">
                                            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 0}
                                                >
                                                    Previous
                                                </button>
                                            </li>

                                            <li className="page-item active">
                                                <span className="page-link">
                                                    Page {currentPage + 1}
                                                </span>
                                            </li>

                                            <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages - 1}
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </>
    );
}
