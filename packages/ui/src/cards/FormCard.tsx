import { Card, CardContent, CardHeader, CardTitle } from "../card";

export default function FormCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {

    return (
        <Card
            className="relative z-10 w-full max-w-[440px] bg-white rounded-3xl shadow-2xl"
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