'use client';
import { usePopup, toast, ConfirmationCard } from '@repo/ui';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";
import { Header } from '../components';
import useCampaign from '@/composable/campaign/useCampaign';
import campaignHttp from '@/Services/http/campaign.http';
import { useRedirectUrl } from '@/composable/useRedirectUrl';
import { CreateCampaignForm } from './-components/CreateCampaignForm';

export default function CampanhasPage() {
    const { showPopup, hidePopup } = usePopup();
    const { campaigns, loading, deleteCampaign, search, setSearch, page, setPage, meta } = useCampaign();
    // Base do site público p/ o link "ver página" de cada campanha.
    const webUrl = useRedirectUrl(process.env.NEXT_PUBLIC_WEB_URL, "");

    const handleCreate = () => {
        showPopup(<CreateCampaignForm onClose={hidePopup} />);
    };

    // A lista traz só o resumo; busca o detalhe (com produtos) antes de abrir o form.
    const handleEdit = async (id: string) => {
        try {
            const detail = await campaignHttp.getById(id);
            showPopup(<CreateCampaignForm onClose={hidePopup} initialData={detail} />);
        } catch {
            toast.error('Erro ao carregar a campanha.');
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        showPopup(
            <ConfirmationCard
                onConfirm={async () => {
                    try {
                        await deleteCampaign(id);
                        toast.success('Campanha excluída com sucesso!');
                        hidePopup();
                    } catch {
                        toast.error('Erro ao excluir a campanha.');
                    }
                }}
                onCancel={hidePopup}
                title="Excluir Campanha"
                description="Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
            />
        );
    };

    return (
        <>
            <Header
                title="Páginas de Campanha"
                subtitle="Páginas temáticas publicadas em /campanha/[slug]."
            />

            <div className="space-y-6">
                <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Campanhas</h2>
                    <button
                        onClick={handleCreate}
                        className="w-full lg:w-auto bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                        Criar Campanha
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"><path d="m21 21-4.34-4.34"></path><circle cx="11" cy="11" r="8"></circle></svg>
                        <input
                            type="text"
                            placeholder="Buscar por título ou URL..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1A2B3C]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-transparent border-0 shadow-none lg:bg-white lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[280px]">Título</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Produtos</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Carregando campanhas...
                                    </TableCell>
                                </TableRow>
                            ) : campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Nenhuma campanha encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                campaigns.map((campaign) => (
                                    <TableRow
                                        key={campaign.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleEdit(campaign.id)}
                                    >
                                        <TableCell>
                                            <span className="font-medium text-[#1A2B3C] text-sm">{campaign.title}</span>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={`${webUrl}/campanha/${campaign.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-1 text-xs text-[#1A2B3C] font-mono hover:text-[#003ba6] hover:underline transition-colors"
                                                title="Abrir página pública"
                                            >
                                                /campanha/{campaign.slug}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link shrink-0" aria-hidden="true"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"></path></svg>
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm text-gray-700">{campaign.productCount}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${campaign.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {campaign.isActive ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, campaign.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Excluir"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2" aria-hidden="true"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button onClick={() => setPage(page - 1)} disabled={page === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
                        <button onClick={() => setPage(page + 1)} disabled={page >= (meta?.lastPage || 1)} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Próxima</button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <p className="text-sm text-gray-700">
                            Mostrando página <span className="font-medium">{page}</span> de{' '}
                            <span className="font-medium">{meta?.lastPage || 1}</span> ({meta?.total || 0} resultados)
                        </p>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button onClick={() => setPage(page - 1)} disabled={page === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                <span className="sr-only">Anterior</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => setPage(page + 1)} disabled={page >= (meta?.lastPage || 1)} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                                <span className="sr-only">Próxima</span>
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
}
