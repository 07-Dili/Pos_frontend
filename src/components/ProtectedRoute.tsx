'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService from '@/services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const user = authService.getCurrentUser();
            const publicPaths = ['/login', '/signup'];

            if (!user && !publicPaths.includes(pathname)) {
                router.push('/login');
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        };

        checkAuth();

        const handleAuthChange = () => {
            checkAuth();
        };

        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, [pathname, router]);

    if (isAuthenticated === null || isAuthenticated === false) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
