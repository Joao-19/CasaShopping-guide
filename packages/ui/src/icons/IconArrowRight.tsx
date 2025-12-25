import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconArrowRight({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            className={cn("size-6", className)}
            {...props}
        >
            <path d="M5 12h14" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M12 5l7 7-7 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}
