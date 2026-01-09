'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import authService from '@/services/authService';
import { useToast } from '@/hooks/useToast';
import ToastContainer from './ToastContainer';

const Navbar: React.FC = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await authService.logout();
            showSuccess('Logged out successfully');
            window.location.href = '/login';
        } catch (error) {
            showError('Logout failed');
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <ToastContainer toasts={toasts} onRemove={removeToast} />
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container-fluid px-4">
                    <Link href="/" className="navbar-brand fw-bold fs-4">
                        POS
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarContent"
                        aria-controls="navbarContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarContent">
                        <ul className="navbar-nav ms-4">
                            <li className="nav-item">
                                <Link
                                    href="/clients"
                                    className={`nav-link px-3 ${isActive('/clients') ? 'active' : ''}`}
                                >
                                    Clients
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    href="/products"
                                    className={`nav-link px-3 ${isActive('/products') ? 'active' : ''}`}
                                >
                                    Products
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    href="/inventory"
                                    className={`nav-link px-3 ${isActive('/inventory') ? 'active' : ''}`}
                                >
                                    Inventory
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link
                                    href="/orders"
                                    className={`nav-link px-3 ${isActive('/orders') ? 'active' : ''}`}
                                >
                                    Orders
                                </Link>
                            </li>
                        </ul>

                        <div className="d-flex align-items-center ms-auto">
                            <div className="dropdown" style={{ position: 'relative' }}>
                                <button
                                    className="btn btn-link text-white text-decoration-none p-0"
                                    type="button"
                                    aria-expanded={showUserMenu}
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="d-flex align-items-center">
                                        <div
                                            className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '40px', height: '40px' }}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="24"
                                                height="24"
                                                fill="currentColor"
                                                className="bi bi-person-fill"
                                                viewBox="0 0 16 16"
                                            >
                                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                            </svg>
                                        </div>
                                    </div>
                                </button>
                                {showUserMenu && (
                                    <ul
                                        className="dropdown-menu dropdown-menu-end show"
                                        style={{
                                            position: 'absolute',
                                            right: 0,
                                            top: '100%',
                                            minWidth: '150px',
                                            zIndex: 1050
                                        }}
                                    >
                                        <li>
                                            <button className="dropdown-item text-danger" onClick={handleLogout}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-box-arrow-right me-2"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                                                    <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
                                                </svg>
                                                Logout
                                            </button>
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Navbar;
