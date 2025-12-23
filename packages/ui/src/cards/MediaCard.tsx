import type { ComponentProps, ReactNode } from "react"
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
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[16px] cursor-pointer group shadow-md transition-transform duration-300 hover:scale-[1.02]",
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
                    <img
                        src={imageSrc}
                        alt={alt}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : null}
                <div className="absolute bg-black/30 inset-0 transition-opacity hover:bg-black/40" />
            </div>

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    )
}
