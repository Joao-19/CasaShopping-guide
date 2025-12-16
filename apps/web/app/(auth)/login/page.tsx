"use client";
import { useRouter } from "next/navigation";

interface LoginPageProps {
    // Tags or props in the future if need
}

const LoginPage: React.FC<LoginPageProps> = ({

}: LoginPageProps) => {
    const router = useRouter();

    const toggleToRegister = () => {
        router.push("/register");
    }

    return (
        <div>
            <h1>Login</h1>
            <button onClick={toggleToRegister}>Register</button>
        </div>
    );
};

export default LoginPage;
