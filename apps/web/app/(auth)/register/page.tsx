import FormCard from "@repo/ui/cards/FormCard";
import Image from "next/image";

interface RegisterPageProps {
    // Tags in the future if need
}

const RegisterPage = () => {

    return (
        <div
            className="h-screen w-full flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: "url('/login-bg.webp')" }}
        >
            <FormCard title="" >
                <div className="flex items-center justify-center">
                    <Image
                        src="/logo.avif"
                        alt="Logo"
                        width={150}
                        height={150}
                    />
                </div>
                <div className="text-center">
                    Entrar na conta
                </div>
            </FormCard>
        </div>
    )
}

export default RegisterPage;
