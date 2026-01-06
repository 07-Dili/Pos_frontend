'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      router.push('/products');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
