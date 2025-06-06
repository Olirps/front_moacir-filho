import React, { useState, useEffect } from 'react';
import { addProdutos, getProdutos, getProdutoById, updateProduto } from '../services/api';
import '../styles/Produtos.css';
import '../styles/Fornecedores.css';
import ModalCadastraProduto from '../components/ModalCadastraProduto';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/hasPermission'; // Certifique-se de importar corretamente a função


function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [cEAN, setcEAN] = useState('');
    const [filteredProdutos, setFilteredProdutos] = useState([]);
    const [xProd, setxProd] = useState('');
    const [loading, setLoading] = useState(true);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [selectedProduto, setSelectedProduto] = useState(null);
    const [isCadastraProdutoModalOpen, setIsCadastraProdutoModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [importSuccess, setCadastroSuccess] = useState(false);
    const { permissions } = useAuth();


    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const response = await getProdutos();
                setProdutos(response.data);
                setFilteredProdutos(response.data);
            } catch (err) {
                console.error('Erro ao buscar produtos', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProdutos();
    }, [importSuccess]);

    const openCadastraProdutoModal = () => {
        setIsCadastraProdutoModalOpen(true);
    };

    const closeCadastraProdutoModal = () => {
        setIsCadastraProdutoModalOpen(false);
    };

    const handleSearch = () => {
        const lowerNome = xProd ? xProd.toLowerCase() : '';
        const lowercEAN = cEAN ? cEAN.toLowerCase() : '';

        const results = produtos.filter(produto =>
            (produto?.xProd ? produto.xProd.toLowerCase().includes(lowerNome) : !lowerNome) &&
            (produto?.cEAN ? produto.cEAN.toLowerCase().includes(lowercEAN) : !lowercEAN));
        setFilteredProdutos(results);
        setCurrentPage(1); // Resetar para a primeira página após a busca
    };

    const handleClear = () => {
        setxProd('');
        setcEAN('');
        setFilteredProdutos(produtos);
        setCurrentPage(1); // Resetar para a primeira página ao limpar a busca
    };

    const handleRowsChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setCurrentPage(1); // Resetar para a primeira página ao alterar o número de linhas
    };

    const handlecEanChange = (e) => {
        setcEAN(e.target.value);
    };
    const handleCadastrarModal = () => {
        if (!hasPermission(permissions, 'clientes', 'insert')) {
            setToast({ message: "Você não tem permissão para cadastrar clientes.", type: "error" });
            return; // Impede a abertura do modal
        }
        openCadastraProdutoModal();
        setIsEdit(false);
        setSelectedProduto(null);

    };

    const handleaddProdutos = async (e) => {
        let newProduto = {};
        if (e.tipoProduto !== 'servico') {
            newProduto = {
                xProd: e.xProd,
                cEAN: e.cEAN,
                qtdMinima: e.qtdMinima,
                qCom: e.qCom,
                valor_unit: e.valor_unit,
                tipoProduto: e.tipo
            };
        } else {
            newProduto = {
                xProd: e.xProd,
                tipoProduto: e.tipoProduto
            };
        }


        try {
            const newProd = await addProdutos(newProduto);
            setToast({ message: `Produto: ${newProd.data.id} - ${newProd.data.xProd}`, type: "success" });
            const response = await getProdutos();
            setProdutos(response.data);
            closeCadastraProdutoModal();
            setCadastroSuccess(prev => !prev); // Atualiza o estado para acionar re-renderização
        } catch (err) {
            const errorMessage = err.response.data.erro;
            setToast({ message: errorMessage, type: "error" });
        }
    };

    const handleEditClick = async (produto) => {
        try {
            if (!hasPermission(permissions, 'produtos', 'viewcadastro')) {
                setToast({ message: "Você não tem permissão para visualizar o cadastro de produtos/serviços.", type: "error" });
                return; // Impede a abertura do modal
            }
            const response = await getProdutoById(produto.id);
            setSelectedProduto(response.data);
            setIsEdit(true);
            openCadastraProdutoModal();
        } catch (err) {
            console.error('Erro ao buscar detalhes do produto', err);
            setToast({ message: "Erro ao buscar detalhes do produto.", type: "error" });
        }
    };

    const handleEditSubmit = async (e) => {
        let updatedProduto = {};

        if (e.tipoProduto !== 'servico') {
            updatedProduto = {
                xProd: e.xProd,
                cEAN: e.cEAN,
                qtdMinima: e.qtdMinima,
                qCom: e.qCom
            };
        } else {
            updatedProduto = {
                xProd: e.xProd,
                tipoProduto: e.tipoProduto
            }
        }
        try {
            await updateProduto(selectedProduto.id, updatedProduto);
            setToast({ message: "Produto atualizado com sucesso!", type: "success" });
            setIsEdit(false);
            closeCadastraProdutoModal();
            setCadastroSuccess(prev => !prev); // Atualiza o estado para acionar re-renderização
        } catch (err) {
            const errorMessage = err.response.data.erro;
            setToast({ message: errorMessage, type: "error" });
        }
    };

    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const totalPages = Math.ceil(filteredProdutos.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentProdutos = filteredProdutos.slice(startIndex, startIndex + rowsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div id="produtos-container">
            <h1 className='title-page'>Consulta de Produtos/Serviços</h1>
            {loading ? (
                <div className="spinner-container">
                    <div className="spinner"></div>
                </div>) : (
                <>
                    <div id="search-container">
                        <div id="search-fields">
                            <div >
                                <label htmlFor="xProd">Nome</label>
                                <input
                                    className="input-geral"
                                    type="text"
                                    id="xProd"
                                    value={xProd}
                                    onChange={(e) => setxProd(e.target.value)}
                                    maxLength="150"
                                />
                            </div>
                            <div>
                                <label htmlFor="cEAN">Código de Barras</label>
                                <input
                                    className="input-geral"
                                    type="text"
                                    id="cEAN"
                                    value={cEAN}
                                    onChange={handlecEanChange}
                                    maxLength="14"
                                />
                            </div>
                        </div>
                        <div>
                            <div id="button-group">
                                <button onClick={handleSearch} className="button">Pesquisar</button>
                                <button onClick={handleClear} className="button">Limpar</button>
                                <button onClick={() => {
                                    handleCadastrarModal();
                                }} className="button">Cadastrar</button>
                            </div>
                        </div>
                    </div>

                    <div id="separator-bar"></div>

                    <div id="results-container">
                        <div id="grid-padrao-container">
                            <table id="grid-padrao">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Cód. Barras</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentProdutos.map((produto) => (
                                        <tr key={produto.id}>
                                            <td>{produto.id}</td>
                                            <td>{produto.xProd}</td>
                                            <td>{produto.cEAN}</td>
                                            <td>
                                                <button onClick={() => handleEditClick(produto)} className="edit-button">Visualizar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div id="pagination-container">
                            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                                Anterior
                            </button>
                            <span>Página {currentPage} de {totalPages}</span>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Próxima
                            </button>
                        </div>

                        <div id="show-more-container">
                            <label htmlFor="rows-select">Mostrar</label>
                            <select id="rows-select" value={rowsPerPage} onChange={handleRowsChange}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <label htmlFor="rows-select">por página</label>
                        </div>
                    </div>
                </>
            )}

            {toast.message && <Toast type={toast.type} message={toast.message} />}
            {isCadastraProdutoModalOpen && (
                <ModalCadastraProduto
                    isOpen={isCadastraProdutoModalOpen}
                    onClose={closeCadastraProdutoModal}
                    onSubmit={isEdit ? handleEditSubmit : handleaddProdutos}
                    produto={selectedProduto}
                    edit={isEdit}
                />
            )}
        </div>
    );
}

export default Produtos;
