import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconFavorite({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className={cn("size-5", className)}
            {...props}
        >
            <path d="M6.25 2.91667C3.7187 2.91667 1.66667 4.96871 1.66667 7.5C1.66667 12.0833 7.08333 16.25 10 17.2192C12.9167 16.25 18.3333 12.0833 18.3333 7.5C18.3333 4.96871 16.2813 2.91667 13.75 2.91667C12.1999 2.91667 10.8295 3.68621 10 4.86408C9.17054 3.68621 7.80012 2.91667 6.25 2.91667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}
