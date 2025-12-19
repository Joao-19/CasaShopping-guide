import { Card, CardContent, CardHeader, CardTitle } from "../card";

export function FormCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {

    return (
        <Card
            className="relative w-full max-w-[440px] max-w-sm-[120px] bg-white rounded-3xl shadow-2xl"
        >
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}