'use client';
import { usePopup } from '../../contexts/PopupContext';
import { Header } from '../components';
import useProduct from '@/composable/product/useProduct';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui/table";
import { ConfirmationCard } from '@repo/ui';
import { CreateProductForm } from './-components/CreateProductForm';

export default function ProdutosPage() {
    const { showPopup, hidePopup } = usePopup();
    const { products, loading, deleteProduct, search, setSearch } = useProduct();

    const handleRegisterProduct = () => {
        showPopup(<CreateProductForm onClose={hidePopup} />);
    };

    const handleProductClick = (product: any) => {
        showPopup(<CreateProductForm onClose={hidePopup} initialData={product} />);
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        showPopup(
            <ConfirmationCard
                onConfirm={async () => {
                    await deleteProduct(id);
                    hidePopup();
                }}
                onCancel={hidePopup}
                title="Excluir Produto"
                description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
            />
        );
    };

    return (
        <>
            <Header
                title="Produtos"
                subtitle="Gerenciamento de produtos do sistema."
            />

            <div className="space-y-6">
                <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-bold text-[#1A2B3C]">Gerenciar Produtos</h2>
                    <button
                        onClick={handleRegisterProduct}
                        className="w-full lg:w-auto bg-[#1A2B3C] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2c455d] transition-colors text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus" aria-hidden="true">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        Cadastrar Produto
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
                            placeholder="Buscar produto por nome, tag..."
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
                                <TableHead className="w-[300px]">Nome</TableHead>
                                <TableHead>Preço</TableHead>
                                <TableHead>Categorias</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Carregando produtos...
                                    </TableCell>
                                </TableRow>
                            ) : (products || []).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        Nenhum produto encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (products || []).map((product) => (
                                    <TableRow
                                        key={product.id}
                                        className="cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <span className="font-medium text-[#1A2B3C] text-sm">{product.name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.price === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                product.price === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {product.price}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.categories.map((cat: string) => (
                                                    <span key={cat} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-600">{product.tags || '-'}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <button
                                                onClick={(e) => handleDeleteClick(e, product.id)}
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
