import { redirect } from "next/navigation";

export default function AdminHome() {
  // Redireciona para o DashBoard - o middleware vai verificar autenticação
  redirect("/DashBoard/lojas");
}