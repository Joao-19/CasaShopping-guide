"use client";

import { ComponentProps, ReactNode, useState, useRef, useEffect } from "react"
import { cn } from "../lib/utils"

interface MediaCardProps extends ComponentProps<"div"> {
    videoSrc?: string
    imageSrc?: string
    alt?: string
    children?: ReactNode
}

export function MediaCard({
    videoSrc,
    imageSrc,
    alt = "Media content",
    children,
    className,
    ...props
}: MediaCardProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (imgRef.current && imgRef.current.complete) {
            setIsLoaded(true);
        }
    }, []);

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[16px] cursor-pointer group shadow-md transition-transform duration-300 hover:scale-[1.02] bg-linear-to-br from-gray-200 via-gray-300 to-gray-200",
                className
            )}
            {...props}
        >
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                {videoSrc ? (
                    <video
                        src={videoSrc}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loop
                        playsInline
                        autoPlay
                        muted
                    />
                ) : imageSrc ? (
                    <>
                        {/* Gradient placeholder is already the background of the container, 
                            but we can add a specific element if needed. 
                            The container bg handles the "behind" logic. 
                        */}
                        <img
                            ref={imgRef}
                            src={imageSrc}
                            alt={alt}
                            onLoad={() => setIsLoaded(true)}
                            className={cn(
                                "absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
                                isLoaded ? "opacity-100" : "opacity-0"
                            )}
                        />
                    </>
                ) : null}
                <div className="absolute bg-black/10 inset-0 transition-opacity hover:bg-black/20" />
            </div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    )
}
