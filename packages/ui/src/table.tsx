import * as React from "react"

import { cn } from "./lib/utils"

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn("w-full text-sm text-left block lg:table", className)} // Changed to block lg:table
            {...props}
        />
    </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("hidden lg:table-header-group bg-gray-50", className)} {...props} /> // Hidden on mobile/tablet
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn(
            // Mobile: Grid 1 col
            // Tablet: Grid 2 cols
            "grid grid-cols-1 md:grid-cols-2 gap-4",
            // Desktop: Table layout
            "lg:table-row-group lg:block-none lg:gap-0 lg:[&_tr:last-child]:border-0 lg:divide-y lg:divide-gray-100",
            className
        )}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 block lg:table-footer-group",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            // Mobile/Tablet: Card style
            "block p-6 border border-gray-200 rounded-lg shadow-sm bg-white h-full", // Removed mb-4, added h-full, p-6
            // Desktop: Table row style
            "lg:table-row lg:mb-0 lg:p-0 lg:border-b lg:shadow-none lg:rounded-none lg:bg-transparent transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-6 py-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            "text-gray-500 text-xs uppercase tracking-wider font-semibold",
            className
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            // Mobile/Tablet: Flow layout/Rows
            "block py-2 px-0 border-b border-gray-50 last:border-0",
            // Desktop: Table cell
            "lg:table-cell lg:p-4 lg:border-b-0 lg:px-6 lg:py-4 align-middle [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
