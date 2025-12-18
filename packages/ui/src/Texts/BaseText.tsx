import React from 'react';
import { cn } from '../lib/utils';

type sizes = "small" | "medium" | "large";

const sizeClasses: Record<sizes, string> = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
};

const colorClasses: Record<BaseTextProps['color'], string> = {
    black: "text-black",
    white: "text-white",
    gray: "text-gray-500",
};

interface BaseTextProps {
    text: string | null;
    size?: sizes,
    color: "black" | "white" | "gray" // TODO Add theme colors here!
}

const BaseText: React.FC<BaseTextProps> = ({ text, size = "medium", color }) => {
    return (
        <div
            className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out w-full text-left",
                sizeClasses[size],
                colorClasses[color],
                text ? "max-h-[100px] opacity-100" : "max-h-0 opacity-0"
            )}
        >
            <p className="p-0 m-0">{text || ""}</p>
        </div>
    );
};

export default BaseText;