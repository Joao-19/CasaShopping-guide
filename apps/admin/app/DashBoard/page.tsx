'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashBoardPage() {
    const router = useRouter();

    useEffect(() => {
        // Redireciona para a página de lojas como padrão
        router.replace('/DashBoard/lojas');
    }, [router]);

    return null;
}
