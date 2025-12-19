'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface PopupContextType {
    isOpen: boolean;
    content: ReactNode | null;
    showPopup: (content: ReactNode) => void;
    hidePopup: () => void;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export function PopupProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);

    const showPopup = useCallback((content: ReactNode) => {
        setContent(content);
        setIsOpen(true);
    }, []);

    const hidePopup = useCallback(() => {
        setIsOpen(false);
        setContent(null); // Optional: clear content on close
    }, []);

    return (
        <PopupContext.Provider value={{ isOpen, content, showPopup, hidePopup }}>
            {children}
        </PopupContext.Provider>
    );
}

export function usePopup() {
    const context = useContext(PopupContext);
    if (context === undefined) {
        throw new Error('usePopup must be used within a PopupProvider');
    }
    return context;
}
