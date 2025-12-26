'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { eventBus } from "@repo/api-client";
import { ErrorPopup } from '@/components/ErrorPopup';

export function GlobalErrorListener() {
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleError = (message: string) => {
            setError(message);
            setIsClosing(false);
        };

        eventBus.on('api-error', handleError);

        return () => {
            eventBus.off('api-error', handleError);
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setError(null);
            setIsClosing(false);
        }, 200); // Wait for animation (200ms)
    };

    if (!mounted || !error) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-200 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                }`}
        >
            <div className={`w-full max-w-md ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'}`}>
                <ErrorPopup
                    message={error}
                    onClose={handleClose}
                />
            </div>
        </div>,
        document.body
    );
}
