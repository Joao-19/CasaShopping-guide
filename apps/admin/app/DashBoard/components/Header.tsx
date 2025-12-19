interface HeaderProps {
    title: string;
    subtitle: string;
    userName?: string;
    userRole?: string;
}

export function Header({
    title,
    subtitle,
    userName = 'Admin',
    userRole = 'Administrador'
}: HeaderProps) {
    // Pega as iniciais do nome do usuário
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-[#1A2B3C]">{title}</h1>
                <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-[#1A2B3C] text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(userName)}
                    </div>
                    <div className="text-sm">
                        <p className="font-semibold text-gray-900 leading-none">{userName}</p>
                        <p className="text-xs text-gray-500">{userRole}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
