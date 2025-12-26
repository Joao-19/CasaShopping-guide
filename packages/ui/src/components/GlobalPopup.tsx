'use client';

import { useEffect, useState } from 'react';
import { usePopup } from '../context/PopupContext';

export function GlobalPopup() {
    const { isOpen, content, hidePopup } = usePopup();
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
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
                setPopupContent(null);
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-200 ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
                }`}
            onClick={hidePopup}
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
