import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconHome({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 22 20"
            fill="none"
            className={cn("size-5", className)}
            {...props}
        >
            <path d="M4.125 7.5V17.5H17.875V7.5L11 2.5L4.125 7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M8.70833 12.0833V17.5H13.2917V12.0833H8.70833Z" stroke="currentColor" strokeLinejoin="round"></path>
            <path d="M4.125 17.5H17.875" stroke="currentColor" strokeLinecap="round"></path>
        </svg>
    )
}
