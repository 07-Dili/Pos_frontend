'use client';

import React from 'react';
import { Order } from '@/types/order.types';

interface OrderDetailsModalProps {
    show: boolean;
    order: Order | null;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ show, order, onClose }) => {
    if (!show || !order) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                <div className="modal-dialog modal-lg modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header bg-primary text-white">
                            <h5 className="modal-title">Order Details - #{order.id}</h5>
                        </div>
                        <div className="modal-body">
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Order ID:</strong> #{order.id}
                                </div>
                                <div className="col-md-6">
                                    <strong>Status:</strong>{' '}
                                    <span className={`badge ${order.status === 'INVOICED' ? 'bg-success' : 'bg-warning'}`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}
                                </div>
                                <div className="col-md-6">
                                    <strong>Total Amount:</strong> ₹{order.totalAmount.toFixed(2)}
                                </div>
                            </div>

                            <hr />

                            <h6 className="mb-3">Order Items</h6>
                            <div className="table-responsive">
                                <table className="table table-striped table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Barcode</th>
                                            <th>Quantity</th>
                                            <th>Selling Price</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items && order.items.length > 0 ? (
                                            order.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>{item.barcode}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>₹{item.sellingPrice.toFixed(2)}</td>
                                                    <td>₹{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted">
                                                    No items found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {order.items && order.items.length > 0 && (
                                        <tfoot className="table-light">
                                            <tr>
                                                <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                                                <td><strong>₹{order.totalAmount.toFixed(2)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderDetailsModal;
