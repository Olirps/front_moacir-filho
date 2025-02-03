import React, { useState, useEffect } from 'react';
import '../styles/ModalMovimentacaoFinanceiraDespesa.css';
import Toast from '../components/Toast';
import ConfirmarLancarParcelas from '../components/ConfirmarLancarParcelas'; // Importando o novo modal
import ConfirmDialog from '../components/ConfirmDialog';
import ModalPesquisaCredor from '../components/ModalPesquisaCredor'; // Importando o modal de pesquisa
import ModalLancamentoParcelas from '../components/ModalLancamentoParcelas'; // Importe o novo modal
import { getLancamentoDespesaById, addMovimentacaofinanceiraDespesa, updateMovimentacaofinanceiraDespesa, cancelarMovimentacaofinanceiraDespesa } from '../services/api';

const ModalMovimentacaoFinanceiraDespesa = ({ isOpen, onClose, movimentacao, onSuccess }) => {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipoCredor, setTipoCredor] = useState('');
    const [dataLancamento, setDataLancamento] = useState('');
    const [dataVencimento, setDataVencimento] = useState('');
    const [tipo, setTipo] = useState('debito');  // Tipo de movimentação (crédito ou débito)
    const [despesaAdicionada, setDespesaAdicionada] = useState('');  // Tipo de movimentação (crédito ou débito)
    const [formError, setFormError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [isModalPesquisaOpen, setIsModalPesquisaOpen] = useState(false);  // Controle do Modal de Pesquisa
    const [credorSelecionado, setCredorSelecionado] = useState(null);  // Crédito selecionado do Modal de Pesquisa
    const [lancarParcelas, setLancarParcelas] = useState(false); // Estado para controlar a opção de parcelamento
    const [isModalParcelasOpen, setIsModalParcelasOpen] = useState(false); // Estado para controlar o modal de parcelas


    useEffect(() => {
        if (isOpen) {
            // Reseta os estados quando o modal é aberto
            if (movimentacao?.id) {
                fetchDespesaData(movimentacao.id);
            } else {
                setDescricao('');
                setValor('');
                setDataVencimento('');
                setTipo('debito');
                setCredorSelecionado(null); // Reseta o crédito selecionado
                setLoading(false);
            }
        }
    }, [isOpen, movimentacao]);

    const resetForm = () => {
        setDescricao('');
        setValor('');
        setDataVencimento('');
        setTipo('debito');
        setCredorSelecionado(null);
        setLancarParcelas(false); // Reseta a opção de parcelamento
        setLoading(false);
    };

    const fetchDespesaData = async (id) => {
        try {
            const response = await getLancamentoDespesaById(id);
            setDescricao(response.data.descricao);
            setValor(response.data.valor);
            setDataVencimento(response.data.data_lancamento);
            setTipo(response.data.tipo || 'debito');
            setCredorSelecionado(response.data.credito || null); // Define o crédito selecionado
            setLoading(false);
        } catch (err) {
            console.error('Erro ao buscar despesa', err);
            setToast({ message: "Erro ao buscar despesa.", type: "error" });
            setLoading(false);
        }
    };

    const handleTipoCredor = (tipo) => {
        setTipoCredor(tipo); // Aqui, o tipo de credor é atualizado no estado do componente pai
    };

    const handleLancaParcelas = ()=>{
        setIsModalParcelasOpen(true)
    }

    const handleSave = async () => {
        if (!descricao || !valor || !dataVencimento || !credorSelecionado) {
            setFormError(true);
            setToast({ message: "Preencha todos os campos e selecione um crédito.", type: "error" });
            return;
        }
        if (lancarParcelas) {
            setIsModalParcelasOpen(true); // Abre o modal de parcelas
            return;
        }

        try {
            const data = {
                descricao,
                valor,
                data_lancamento: dataVencimento,
                tipo,
                ...(tipoCredor === 'funcionario' && { funcionario_id: credorSelecionado.id }),
                ...(tipoCredor === 'fornecedor' && { fornecedor_id: credorSelecionado.id }),
                ...(tipoCredor === 'cliente' && { cliente_id: credorSelecionado.id })
            };


            if (movimentacao) {
                await updateMovimentacaofinanceiraDespesa(movimentacao.id, data);
            } else {

                const despesaAdicionada = await addMovimentacaofinanceiraDespesa(data);

                // Verifica se a despesa foi adicionada com sucesso
                if (despesaAdicionada) {
                    setToast({ message: "Despesa salva com sucesso!", type: "success" });
                    // Chama a função para abrir o ConfirmarLancarParcelas
                    handleConfirmarLancarParcelas(despesaAdicionada);
                    onSuccess();
                }
            }
            setToast({ message: "Despesa salva com sucesso!", type: "success" });
        } catch (err) {
            console.error('Erro ao salvar despesa', err);
            setToast({ message: "Erro ao salvar despesa.", type: "error" });
        }
    };

    const handleConfirmarLancarParcelas = (despesa) => {
        setDespesaAdicionada(despesa);
        setMensagem("Despesa salva com sucesso! Deseja lançar as parcelas?");
        setIsConfirmDialogOpen(true); // Abre o ConfirmDialog
    };

    const handleCancelar = () => {
        if (!movimentacao) return;
        setMensagem('Deseja realmente excluir esta despesa?')
        setIsConfirmDialogOpen(true);
    };

    const handleSaveParcelas = (parcelas) => {
        // Aqui você pode enviar as parcelas para o backend ou processá-las conforme necessário
        console.log("Parcelas salvas:", parcelas);
        setToast({ message: "Parcelas salvas com sucesso!", type: "success" });
        onSuccess();
        onClose();
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
                                    value={credorSelecionado ? (credorSelecionado.nome || credorSelecionado.cliente?.nome) : ""}
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
                                    onChange={(e) => setDescricao(e.target.value.toUpperCase())}
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
                                <label>Data de Vencimento</label>
                                <input
                                    className='input-geral'
                                    type="date"
                                    value={dataVencimento}
                                    onChange={(e) => setDataVencimento(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label>Tipo</label>
                                <select className='input-geral' value={tipo} onChange={(e) => setTipo(e.target.value)} required>
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
            {toast.message && <Toast message={toast.message} type={toast.type} />}
            {isConfirmDialogOpen && (
                <ConfirmarLancarParcelas
                    isOpen={isConfirmDialogOpen}
                    message={mensagem}
                    onConfirm={handleLancaParcelas}  // Abre o modal de lançamento de parcelas
                    onCancel={() => setIsConfirmDialogOpen(false)}
                />
            )
            }
            <ModalPesquisaCredor
                isOpen={isModalPesquisaOpen}
                onClose={() => setIsModalPesquisaOpen(false)}
                onSelectCredor={handleSelectCredor}
                onTipoCredor={handleTipoCredor}  // Passando a função para o modal
            />

            <ModalLancamentoParcelas
                isOpen={isModalParcelasOpen}
                onClose={() => setIsModalParcelasOpen(false)}
                valorTotal={valor}
                despesa={despesaAdicionada}
                onSave={handleSaveParcelas}
            />
        </div>
    );
};

export default ModalMovimentacaoFinanceiraDespesa;