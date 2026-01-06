'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ToastContainer from '@/components/ToastContainer';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import CreateOrderModal from '@/components/CreateOrderModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/useToast';
import orderService from '@/services/orderService';
import authService from '@/services/authService';
import { Order, OrderStatus } from '@/types/order.types';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [generatingInvoice, setGeneratingInvoice] = useState<number | null>(null);
    const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(null);
    const { toasts, showSuccess, showError, removeToast } = useToast();

    const pageSize = 10;

    useEffect(() => {
        fetchOrders(currentPage);
    }, [currentPage]);

    const fetchOrders = async (page: number) => {
        try {
            setLoading(true);
            const response = await orderService.getAll(page, pageSize);
            setOrders(response);
            if (response.length < pageSize) {
                setTotalPages(page + 1);
            } else {
                setTotalPages(page + 2);
            }
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewDetails = async (orderId: number) => {
        try {
            const order = await orderService.getById(orderId);
            setSelectedOrder(order);
            setShowDetailsModal(true);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to fetch order details');
        }
    };

    const handleGenerateInvoice = async (orderId: number) => {
        try {
            setGeneratingInvoice(orderId);
            await orderService.generateInvoice(orderId);
            showSuccess('Invoice generated successfully!');
            await fetchOrders(currentPage);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setGeneratingInvoice(null);
        }
    };

    const handleDownloadInvoice = async (orderId: number) => {
        try {
            setDownloadingInvoice(orderId);
            const blob = await orderService.downloadInvoice(orderId);

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${orderId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showSuccess('Invoice downloaded successfully!');
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to download invoice');
        } finally {
            setDownloadingInvoice(null);
        }
    };

    const handleCreateOrder = async (items: any[]) => {
        try {
            const user = authService.getCurrentUser();
            if (!user) {
                showError('Please login to create an order');
                return;
            }

            const orderData = {
                items: items.map(item => ({
                    barcode: item.barcode,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice,
                })),
            };

            await orderService.create(user.id, orderData);
            showSuccess('Order created successfully!');
            await fetchOrders(currentPage);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to create order');
            throw err;
        }
    };

    return (
        <ProtectedRoute>
            <Navbar />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <OrderDetailsModal
                show={showDetailsModal}
                order={selectedOrder}
                onClose={() => setShowDetailsModal(false)}
            />
            <CreateOrderModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateOrder}
            />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Orders</h2>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
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
                        Create Order
                    </button>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-primary">
                                    <tr>
                                        <th className="text-center" style={{ width: '8%' }}>Order ID</th>
                                        <th className="text-center" style={{ width: '20%' }}>Created At</th>
                                        <th className="text-center" style={{ width: '12%' }}>Total Amount</th>
                                        <th className="text-center" style={{ width: '12%' }}>Status</th>
                                        <th className="text-center" style={{ width: '38%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-4">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id}>
                                                <td className="text-center">#{order.id}</td>
                                                <td className="text-center">{new Date(order.createdAt).toLocaleString()}</td>
                                                <td className="text-center">₹{order.totalAmount.toFixed(2)}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${order.status === OrderStatus.INVOICED ? 'bg-success' : 'bg-warning'}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button
                                                            className="btn btn-info"
                                                            onClick={() => handleViewDetails(order.id)}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="16"
                                                                height="16"
                                                                fill="currentColor"
                                                                className="bi bi-eye"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
                                                                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                                                            </svg>
                                                            {' '}View Details
                                                        </button>

                                                        {order.status === OrderStatus.CREATED ? (
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => handleGenerateInvoice(order.id)}
                                                                disabled={generatingInvoice === order.id}
                                                            >
                                                                {generatingInvoice === order.id ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        Generating...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            fill="currentColor"
                                                                            className="bi bi-file-earmark-text"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
                                                                            <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
                                                                        </svg>
                                                                        {' '}Generate Invoice
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn btn-success"
                                                                onClick={() => handleDownloadInvoice(order.id)}
                                                                disabled={downloadingInvoice === order.id}
                                                            >
                                                                {downloadingInvoice === order.id ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                                        Downloading...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="16"
                                                                            height="16"
                                                                            fill="currentColor"
                                                                            className="bi bi-download"
                                                                            viewBox="0 0 16 16"
                                                                        >
                                                                            <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                                                                            <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                                                                        </svg>
                                                                        {' '}Download Invoice
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
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
        </ProtectedRoute>
    );
}
