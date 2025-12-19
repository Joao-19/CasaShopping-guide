'use client';

import { usePopup } from '../contexts/PopupContext';

export function GlobalPopup() {
    const { isOpen, content, hidePopup } = usePopup();

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all animate-in fade-in zoom-in-95 duration-200"
        // Optional: Close on backdrop click (uncomment if desired)
        // onClick={hidePopup}
        >
            <div
                className="relative z-50 animate-in slide-in-from-bottom-5 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {content}
            </div>
        </div>
    );
}
