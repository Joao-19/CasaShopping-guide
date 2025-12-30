import type { ComponentProps } from "react"
import { cn } from "../lib/utils"

export function IconLogout({ className, ...props }: ComponentProps<"svg">) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="none"
            className={cn("size-5", className)}
            {...props}
        >
            <path d="M12.5 6.875V5.3125C12.5 4.8981 12.3354 4.50067 12.0424 4.20765C11.7493 3.91462 11.3519 3.75 10.9375 3.75H3.4375C3.0231 3.75 2.62567 3.91462 2.33265 4.20765C2.03962 4.50067 1.875 4.8981 1.875 5.3125V14.6875C1.875 15.1019 2.03962 15.4993 2.33265 15.7924C2.62567 16.0854 3.0231 16.25 3.4375 16.25H10.9375C11.3519 16.25 11.7493 16.0854 12.0424 15.7924C12.3354 15.4993 12.5 15.1019 12.5 14.6875V13.125M15 6.875L18.125 10M18.125 10L15 13.125M18.125 10H7.46094" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
        </svg>
    )
}
