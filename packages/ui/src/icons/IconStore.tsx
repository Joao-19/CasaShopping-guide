import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconStore({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className={cn("size-5", className)}
            {...props}
        >
            <path d="M16.683 9.16667V17.5H3.34961V9.16667" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M2.4343 5.74025C1.79698 7.39071 3.02628 9.16667 4.7955 9.16667C6.17621 9.16667 7.30317 8.04737 7.30317 6.66667C7.30317 8.04737 8.42246 9.16667 9.80317 9.16667H10.2275C11.6082 9.16667 12.7275 8.04737 12.7275 6.66667C12.7275 8.04737 13.8549 9.16667 15.2356 9.16667C17.0058 9.16667 18.2362 7.38967 17.5984 5.73846L16.3474 2.5H3.68551L2.4343 5.74025Z" stroke="currentColor" strokeLinejoin="round"></path>
        </svg>
    )
}
