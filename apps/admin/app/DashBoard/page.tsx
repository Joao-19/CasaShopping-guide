import { redirect } from "next/navigation";

export default function DashBoardPage() {
    // Redireciona para a página de lojas como padrão
    redirect("/DashBoard/lojas");
}
