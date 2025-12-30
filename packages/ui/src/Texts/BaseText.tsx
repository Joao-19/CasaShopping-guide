import React from 'react';
import { cn } from '../lib/utils';

type sizes = "small" | "medium" | "large" | "xl" | "extra-small";

const sizeClasses: Record<sizes, string> = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xl: "text-xl",
    "extra-small": "text-xs",
};

const colorClasses: Record<BaseTextProps['color'], string> = {
    black: "text-black",
    white: "text-white",
    gray: "text-gray-400",
};

interface BaseTextProps {
    text: string | null;
    size?: sizes;
    color: "black" | "white" | "gray"; // TODO Add theme colors here!
    className?: string;
}

export const BaseText: React.FC<BaseTextProps> = ({ text, size = "medium", color, className }) => {
    return (
        <div
            className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out w-full text-left",
                text ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0",
            )}
        >
            <p className={cn(
                "p-0 m-0",
                sizeClasses[size],
                colorClasses[color],
                className
            )}>
                {text || ""}
            </p>
        </div>
    );
};
