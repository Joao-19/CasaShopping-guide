'use client';

import { useEffect } from 'react';
import { usePopup } from '../contexts/PopupContext';
import { eventBus } from '@/utils/eventBus';
import { ErrorPopup } from './ErrorPopup';

export function GlobalErrorListener() {
    const { showPopup, hidePopup } = usePopup();

    useEffect(() => {
        const handleError = (message: string) => {
            showPopup(
                <ErrorPopup
                    message={message}
                    onClose={hidePopup}
                />
            );
        };

        eventBus.on('api-error', handleError);

        return () => {
            eventBus.off('api-error', handleError);
        };
    }, [showPopup, hidePopup]);

    return null;
}
