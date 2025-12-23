'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { eventBus } from '@/utils/eventBus';
import { ErrorPopup } from './ErrorPopup';

export function GlobalErrorListener() {
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleError = (message: string) => {
            setError(message);
        };

        eventBus.on('api-error', handleError);

        return () => {
            eventBus.off('api-error', handleError);
        };
    }, []);

    if (!mounted || !error) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <ErrorPopup
                message={error}
                onClose={() => setError(null)}
            />
        </div>,
        document.body
    );
}
