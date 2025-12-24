"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    position?: "left" | "right";
}

export function Drawer({
    isOpen,
    onClose,
    children,
    position = "right",
}: DrawerProps) {
    const [mounted, setMounted] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [animateOpen, setAnimateOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            document.body.style.overflow = "hidden";
        } else {
            setAnimateOpen(false);
            const timer = setTimeout(() => {
                setShouldRender(false);
                document.body.style.overflow = "unset";
            }, 300); // Match transition duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (shouldRender && isOpen) {
            // Use double requestAnimationFrame to ensure the browser has painted the initial state
            // (opacity-0, translate) before switching to the open state.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimateOpen(true);
                });
            });
        }
    }, [shouldRender, isOpen]);

    if (!mounted) return null;

    if (!shouldRender) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${animateOpen ? "opacity-100" : "opacity-0"
                    }`}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 bottom-0 ${position === "right" ? "right-0" : "left-0"
                    } w-full max-w-sm bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${animateOpen
                        ? "translate-x-0"
                        : position === "right"
                            ? "translate-x-full"
                            : "-translate-x-full"
                    }`}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
