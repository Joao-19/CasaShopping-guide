import { Assets } from "@repo/ui";

export default function PersonalizacaoPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
            <div className="bg-gray-100 p-6 rounded-full mb-6 animate-pulse">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Página em Construção</h1>
            <p className="text-gray-500 max-w-md">
                Estamos trabalhando para trazer funcionalidades incríveis de personalização para você. Volte em breve!
            </p>
        </div>
    );
}
