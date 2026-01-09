'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import ToastContainer from '@/components/ToastContainer';
import OrderDetailsModal from '@/components/OrderDetailsModal';
import CreateOrderModal from '@/components/CreateOrderModal';
import { useToast } from '@/hooks/useToast';
import { useDebounce } from '@/hooks/useDebounce';
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
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [filterType, setFilterType] = useState<string>('');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [searchId, setSearchId] = useState<string>('');
    const [isFiltering, setIsFiltering] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const debouncedSearchId = useDebounce(searchId, 500);

    const pageSize = 10;

    useEffect(() => {
        if (isFiltering) {
            if (filterType === 'date' && fromDate && toDate) {
                handleDateFilter();
            } else if (filterType === 'status' && selectedStatus) {
                handleStatusFilter();
            } else if (filterType === 'id') {
                return;
            }
        } else {
            fetchOrders(currentPage);
        }
    }, [currentPage]);

    useEffect(() => {
        if (filterType === 'id') {
            if (debouncedSearchId) {
                handleIdSearch();
            } else if (searchId === '') {
                setIsFiltering(false);
                setCurrentPage(0);
                fetchOrders(0);
            }
        }
    }, [debouncedSearchId]);


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

    const formatDateForBackend = (dateString: string): string => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const handleDateFilter = async () => {
        if (!fromDate || !toDate) {
            showError('Please select both from and to dates');
            return;
        }

        if (new Date(fromDate) > new Date(toDate)) {
            showError('From date cannot be after to date');
            return;
        }

        try {
            setLoading(true);
            setIsFiltering(true);
            const formattedFrom = formatDateForBackend(fromDate);
            const formattedTo = formatDateForBackend(toDate);
            const response = await orderService.getByDateRange(formattedFrom, formattedTo, currentPage, pageSize);
            setOrders(response);
            if (response.length < pageSize) {
                setTotalPages(currentPage + 1);
            } else {
                setTotalPages(currentPage + 2);
            }
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to filter orders');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilter = () => {
        setFromDate('');
        setToDate('');
        setSelectedStatus('');
        setSearchId('');
        setFilterType('');
        setShowFilterDropdown(false);
        setIsFiltering(false);
        setCurrentPage(0);
        fetchOrders(0);
    };

    const handleFilterTypeSelect = (type: string) => {
        setFilterType(type);
        setShowFilterDropdown(false);
        setFromDate('');
        setToDate('');
        setSelectedStatus('');
    };

    const handleStatusFilter = async () => {
        if (!selectedStatus) {
            showError('Please select a status');
            return;
        }

        try {
            setLoading(true);
            setIsFiltering(true);
            const response = await orderService.getByStatus(selectedStatus, currentPage, pageSize);
            setOrders(response);
            if (response.length < pageSize) {
                setTotalPages(currentPage + 1);
            } else {
                setTotalPages(currentPage + 2);
            }
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to filter orders');
        } finally {
            setLoading(false);
        }
    };

    const handleIdSearch = async () => {
        if (!searchId) {
            showError('Please enter an order ID');
            return;
        }

        try {
            setLoading(true);
            setIsFiltering(true);
            const order = await orderService.getById(Number(searchId));
            setOrders([order]);
            setTotalPages(1);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Order not found');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        if (filterType === 'date') {
            handleDateFilter();
        } else if (filterType === 'status') {
            handleStatusFilter();
        } else if (filterType === 'id') {
            handleIdSearch();
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
            const orderData = {
                items: items.map(item => ({
                    barcode: item.barcode,
                    quantity: item.quantity,
                    sellingPrice: item.sellingPrice,
                })),
            };

            await orderService.create(orderData);
            showSuccess('Order created successfully!');
            setShowCreateModal(false);
            fetchOrders(currentPage);
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to create order');
            throw err;
        }
    };

    return (
        <>
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
                <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <div className="dropdown">
                        <button
                            className="btn btn-primary dropdown-toggle"
                            type="button"
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-funnel me-1"
                                viewBox="0 0 16 16"
                            >
                                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
                            </svg>
                            Filter By
                        </button>
                        {showFilterDropdown && (
                            <ul className="dropdown-menu show">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleFilterTypeSelect('date')}
                                    >
                                        Date Range
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleFilterTypeSelect('status')}
                                    >
                                        Status
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        onClick={() => handleFilterTypeSelect('id')}
                                    >
                                        Order ID
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>

                    {filterType === 'date' && (
                        <div className="d-flex gap-2 flex-grow-1">
                            <input
                                type="date"
                                className="form-control"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                placeholder="From Date"
                            />
                            <input
                                type="date"
                                className="form-control"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                placeholder="To Date"
                            />
                            <button
                                className="btn btn-success"
                                onClick={handleDateFilter}
                                disabled={loading}
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    {filterType === 'status' && (
                        <div className="d-flex gap-2 flex-grow-1">
                            <select
                                className="form-select"
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="">Select Status</option>
                                <option value="CREATED">Created</option>
                                <option value="INVOICED">Invoiced</option>
                            </select>
                            <button
                                className="btn btn-success"
                                onClick={handleStatusFilter}
                                disabled={loading}
                            >
                                Apply
                            </button>
                        </div>
                    )}


                    {filterType === 'id' && (
                        <div className="d-flex gap-2 flex-grow-1">
                            <input
                                type="number"
                                className="form-control"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="Enter Order ID"
                            />
                            <button
                                className="btn btn-success"
                                onClick={handleIdSearch}
                                disabled={loading}
                            >
                                Apply
                            </button>
                        </div>
                    )}

                    {isFiltering && (
                        <button
                            className="btn btn-secondary"
                            onClick={handleClearFilter}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-x-circle me-1"
                                viewBox="0 0 16 16"
                            >
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                            </svg>
                            Clear
                        </button>
                    )}

                    <button
                        className="btn btn-primary ms-auto"
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
        </>
    );
}
