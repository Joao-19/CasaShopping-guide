import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconHeart({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("size-6", className)}
            {...props}
        >
            <path d="M7.5 3.5C4.46244 3.5 2 5.96245 2 9C2 14.5 8.5 19.5 12 20.6631C15.5 19.5 22 14.5 22 9C22 5.96245 19.5375 3.5 16.5 3.5C14.6399 3.5 12.9954 4.42345 12 5.8369C11.0046 4.42345 9.36015 3.5 7.5 3.5Z" />
        </svg>
    )
}
