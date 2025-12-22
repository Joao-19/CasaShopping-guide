'use client';

import { useEffect, useState } from 'react';
import { usePopup } from '../contexts/PopupContext';

export function GlobalPopup() {
    const { isOpen, content } = usePopup();
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [popupContent, setPopupContent] = useState(content);

    useEffect(() => {
        if (content) {
            setPopupContent(content);
        }
    }, [content]);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
        } else if (isVisible) {
            // Start closing animation
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
                setPopupContent(null); // Clear local content after animation
            }, 200); // Duration matches animation-zoomOut
            return () => clearTimeout(timer);
        }
    }, [isOpen]); // Removed isVisible from dependency to avoid loop

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                }`}
        // Optional: Close on backdrop click (uncomment if desired)
        // onClick={hidePopup}
        >
            <div
                className={`relative z-50 p-4 ${isClosing ? 'animate-zoomOut' : 'animate-zoomIn'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {popupContent}
            </div>
        </div>
    );
}
