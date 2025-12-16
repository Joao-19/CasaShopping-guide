import { Card, CardContent, CardHeader, CardTitle } from "../card";

export default function FormCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {


    return (
        <Card className="w-100" style={cardStyle}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    )
}

const cardStyle = {
    width: "400px",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    padding: "20px",
}