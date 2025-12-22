'use client';
import { useEffect } from 'react';
import { usePopup } from '../../contexts/PopupContext';
import { CreateStoreForm } from './-components/CreateStoreForm';
import { Header } from '../components';
import useStore from '@/composable/store/useStore';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";

import { CreateStoreDto, Store } from '@repo/dtos';
import { ConfirmationCard } from '@repo/ui';

export default function LojasPage() {
    const { showPopup, hidePopup } = usePopup();
    const { stores, loading, deleteStore, search, setSearch } = useStore();
    // However, the original code had useEffect. Let's remove it if it's no longer needed or keep empty.
    // Actually, createStore calls queryClient.invalidateQueries so list updates auto.
    // We can remove the useEffect.

    const handleRegisterStore = () => {
        showPopup(
            <CreateStoreForm onClose={hidePopup} />
        );
    };

    const handleStoreClick = (store: Store) => {
        showPopup(
            <CreateStoreForm onClose={hidePopup} initialData={store} />
        );
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        showPopup(
            <ConfirmationCard
                onConfirm={async () => {
                    await deleteStore(id);
                    hidePopup();
                }}
                onCancel={hidePopup}
                title="Excluir Loja"
                description="Tem certeza que deseja excluir esta loja? Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
            />
        );
    };

    return (
        <>
            <Header
                title="Lojas"
                subtitle="Gerenciamento de lojas do sistema."
            />

            <div className="space-y-6">
                <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Lojas</h2>
                    <button
                        onClick={handleRegisterStore}
                        className="w-full lg:w-auto bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        Cadastrar Loja
                    </button>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                    <div className="relative flex-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                            <path d="m21 21-4.34-4.34"></path>
                            <circle cx="11" cy="11" r="8"></circle>
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar loja por nome..."
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
                                <TableHead className="w-[300px]">Loja</TableHead>
                                <TableHead>Endereço</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Redes</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Carregando lojas...
                                    </TableCell>
                                </TableRow>
                            ) : (stores || []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Nenhuma loja cadastrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (stores || []).map((store) => (
                                    <TableRow
                                        key={store.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleStoreClick(store)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    {store.logoImage && store.logoImage.length > 2 ? (
                                                        <img src={store.logoImage} alt={store.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[#1A2B3C] font-bold text-xs">
                                                            {store.name.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="font-medium text-[#1A2B3C] text-sm">{store.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin text-gray-400" aria-hidden="true">
                                                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                {store.address}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone text-gray-400" aria-hidden="true">
                                                    <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"></path>
                                                </svg>
                                                {store.phone || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 text-gray-400">
                                                {store.facebookLink && (
                                                    <a
                                                        href={store.facebookLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook hover:text-blue-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                                                        </svg>
                                                    </a>
                                                )}
                                                {store.instagramLink && (
                                                    <a
                                                        href={store.instagramLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram hover:text-pink-600 cursor-pointer" aria-hidden="true">
                                                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                                                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                                                        </svg>
                                                    </a>
                                                )}
                                                {store.youtubeLink && (
                                                    <a
                                                        href={store.youtubeLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube hover:text-red-600 cursor-pointer" aria-hidden="true">
                                                            <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                                                            <path d="m10 15 5-3-5-3z"></path>
                                                        </svg>
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, store.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                title="Excluir"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2 lucide-trash-2" aria-hidden="true">
                                                    <path d="M10 11v6"></path>
                                                    <path d="M14 11v6"></path>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                                                    <path d="M3 6h18"></path>
                                                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
