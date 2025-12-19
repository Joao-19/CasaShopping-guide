import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { cn } from "../lib/utils";

export function FormCard({
    title,
    children,
    className,
    headerAction,
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerAction?: React.ReactNode;
}) {

    return (
        <Card
            className={cn(
                "relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl",
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>{title}</CardTitle>
                {headerAction && <div>{headerAction}</div>}
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}
