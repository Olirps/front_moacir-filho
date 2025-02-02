import React, { useState, useEffect } from 'react';
import '../styles/ModalMovimentacaoFinanceiraDespesa.css';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import ModalPesquisaCredor from '../components/ModalPesquisaCredor'; // Importando o modal de pesquisa
import { getLancamentoDespesaById, addMovimentacaofinanceiraDespesa, updateMovimentacaofinanceiraDespesa, cancelarMovimentacaofinanceiraDespesa } from '../services/api';

const ModalMovimentacaoFinanceiraDespesa = ({ isOpen, onClose, movimentacao, onSuccess }) => {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [dataLancamento, setDataLancamento] = useState('');
    const [tipo, setTipo] = useState('credito');  // Tipo de movimentação (crédito ou débito)
    const [formError, setFormError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [isModalPesquisaOpen, setIsModalPesquisaOpen] = useState(false);  // Controle do Modal de Pesquisa
    const [credorSelecionado, setCredorSelecionado] = useState(null);  // Crédito selecionado do Modal de Pesquisa

    useEffect(() => {
        if (isOpen) {
            // Reseta os estados quando o modal é aberto
            if (movimentacao?.id) {
                fetchDespesaData(movimentacao.id);
            } else {
                setDescricao('');
                setValor('');
                setDataLancamento('');
                setTipo('credito');
                setCredorSelecionado(null); // Reseta o crédito selecionado
                setLoading(false);
            }
        }
    }, [isOpen, movimentacao]);

    const fetchDespesaData = async (id) => {
        try {
            const response = await getLancamentoDespesaById(id);
            setDescricao(response.data.descricao);
            setValor(response.data.valor);
            setDataLancamento(response.data.data_lancamento);
            setTipo(response.data.tipo || 'credito');
            setCredorSelecionado(response.data.credito || null); // Define o crédito selecionado
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar despesa', err);
            setToast({ message: "Erro ao buscar despesa.", type: "error" });
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!descricao || !valor || !dataLancamento || !credorSelecionado) {
            setFormError(true);
            setToast({ message: "Preencha todos os campos e selecione um crédito.", type: "error" });
            return;
        }

        try {
            const data = {
                descricao,
                valor,
                data_lancamento: dataLancamento,
                tipo,
                credor_id: credorSelecionado.id, // Usa o ID do crédito selecionado
            };

            if (movimentacao) {
                await updateMovimentacaofinanceiraDespesa(movimentacao.id, data);
            } else {
                await addMovimentacaofinanceiraDespesa(data);
            }
            setToast({ message: "Despesa salva com sucesso!", type: "success" });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar despesa', err);
            setToast({ message: "Erro ao salvar despesa.", type: "error" });
        }
    };

    const handleCancelar = () => {
        if (!movimentacao) return;
        setIsConfirmDialogOpen(true);
    };

    const confirmCancelamento = async () => {
        try {
            await cancelarMovimentacaofinanceiraDespesa(movimentacao.id);
            setToast({ message: "Despesa excluída com sucesso!", type: "success" });
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao excluir despesa', err);
            setToast({ message: "Erro ao excluir despesa.", type: "error" });
        }
        setIsConfirmDialogOpen(false);
    };

    const handleOpenPesquisaCredito = () => {
        setIsModalPesquisaOpen(true);
    };

    const handleSelectCredor = (credor) => {
        setCredorSelecionado(credor);  // Atualiza o crédito selecionado
        setIsModalPesquisaOpen(false);  // Fecha o modal de pesquisa
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{movimentacao ? "Editar Despesa" : "Cadastrar Despesa"}</h2>
                <div>
                    <button className='button-geral' onClick={handleOpenPesquisaCredito}>Pesquisar Credor</button>
                </div>
                {loading ? (
                    <div className="spinner-container">
                        <div className="spinner"></div>
                    </div>
                ) : (
                    <>
                        <div id='cadastro-padrao'>
                            <div>
                                <label>Credor</label>
                                <input
                                    type="text"
                                    className="input-geral"
                                    value={credorSelecionado ? (credorSelecionado.nome || credorSelecionado.cliente?.nome) : "" }
                                    onClick={handleOpenPesquisaCredito}
                                    readOnly
                                    placeholder="Selecionar Credor"
                                    disabled
                                />
                            </div>
                            <div>
                                <label>Descrição</label>
                                <input
                                    className='input-geral'
                                    type="text"
                                    value={descricao.toUpperCase()}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Valor</label>
                                <input
                                    className='input-geral'
                                    type="text"
                                    value={valor.replace(',', '.')}
                                    onChange={(e) => setValor(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Data de Lançamento</label>
                                <input
                                    className='input-geral'
                                    type="date"
                                    value={dataLancamento}
                                    onChange={(e) => setDataLancamento(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Tipo</label>
                                <select className='input-geral' value={tipo} onChange={(e) => setTipo(e.target.value)} required>
                                    <option value="credito">Crédito</option>
                                    <option value="debito">Débito</option>
                                </select>
                            </div>
                            <div id='botao-salva'>
                                <button className="button-geral" onClick={handleSave}>Salvar</button>
                                {movimentacao && <button className="button delete" onClick={handleCancelar}>Excluir</button>}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <ConfirmDialog
                isOpenConfirm={isConfirmDialogOpen}
                message="Deseja realmente excluir esta despesa?"
                onConfirm={confirmCancelamento}
                onCancel={() => setIsConfirmDialogOpen(false)}
            />

            {toast.message && <Toast message={toast.message} type={toast.type} />}

            <ModalPesquisaCredor
                isOpen={isModalPesquisaOpen}
                onClose={() => setIsModalPesquisaOpen(false)}
                onSelectCredor={handleSelectCredor}
            />
        </div>
    );
};

export default ModalMovimentacaoFinanceiraDespesa;