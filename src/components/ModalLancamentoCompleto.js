import React, { useState, useEffect } from 'react';
import '../styles/ModalLancamentoCompleto.css';
import ConfirmarLancarParcelas from '../components/ConfirmarLancarParcelas'; // Importando o novo modal
import { cpfCnpjMask } from './utils';


const ModalLancamentoCompleto = ({ isOpen, onClose, onConfirmar, lancamento }) => {
    const [lancamentoCompleto, setLancamentoCompleto] = useState(null);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [cancelarLancto, setCancelarLancto] = useState(false); // Estado para controlar o modal de parcelas
        const [mensagem, setMensagem] = useState('');
    


    useEffect(() => {
        if (lancamento) {
            setLancamentoCompleto(lancamento.data);
        }
    }, [lancamento]);
    const handleCancelar = () => {
        if (!lancamento.data) return;
        setCancelarLancto(true)
        setMensagem('Deseja realmente excluir esta despesa?')
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmCancelamento = async () => {
        const dadosLancto = lancamento.data
        onConfirmar(dadosLancto);
    }

    if (!isOpen || !lancamentoCompleto) return null;

    // Função para formatar a data no formato brasileiro
    const formatarData = (data) => {
        if (!data) return '-';
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Lançamento Completo</h2>

                {/* Detalhes do Lançamento */}
                <div className="lancamento-detalhes">
                    <h3>Detalhes do Lançamento</h3>
                    <p><strong>Descrição:</strong> {lancamentoCompleto.descricao}</p>
                    <p><strong>Valor:</strong> R$ {lancamentoCompleto.valor.toFixed(2)}</p>
                    <p><strong>Data de Vencimento:</strong> {formatarData(lancamentoCompleto.data_vencimento)}</p>
                    <p><strong>Data de Lançamento:</strong> {formatarData(lancamentoCompleto.data_lancamento)}</p>
                    <p><strong>Tipo:</strong> {lancamentoCompleto.tipo}</p>
                    <p><strong>Status:</strong> {lancamentoCompleto.status}</p>
                </div>

                {/* Detalhes da Entidade (Fornecedor, Funcionário ou Cliente) */}
                {lancamentoCompleto.fornecedor && (
                    <div className="entidade-detalhes">
                        <h3>Fornecedor</h3>
                        <p><strong>Nome:</strong> {lancamentoCompleto.fornecedor.nome}</p>
                        <p><strong>CNPJ:</strong> {cpfCnpjMask(lancamentoCompleto.fornecedor.cpfCnpj)}</p>
                        <p><strong>Endereço:</strong> {lancamentoCompleto.fornecedor.logradouro}, {lancamentoCompleto.fornecedor.numero}</p>
                        <p><strong>Município:</strong> {lancamentoCompleto.fornecedor.municipio} - {lancamentoCompleto.fornecedor.uf}</p>
                    </div>
                )}

                {lancamentoCompleto.funcionario && (
                    <div className="entidade-detalhes">
                        <h3>Funcionário</h3>
                        <p><strong>Nome:</strong> {lancamentoCompleto.funcionario.cliente.nome}</p>
                        <p><strong>CPF:</strong> {cpfCnpjMask(lancamentoCompleto.funcionario.cliente.cpfCnpj)}</p>
                        <p><strong>Cargo:</strong> {lancamentoCompleto.funcionario.cargo}</p>
                        <p><strong>Salário:</strong> R$ {lancamentoCompleto.funcionario.salario.toFixed(2)}</p>
                    </div>
                )}

                {lancamentoCompleto.cliente && (
                    <div className="entidade-detalhes">
                        <h3>Cliente</h3>
                        <p><strong>Nome:</strong> {lancamentoCompleto.cliente.nome}</p>
                        <p><strong>CPF/CNPJ:</strong> {cpfCnpjMask(lancamentoCompleto.cliente.cpfCnpj)}</p>
                        <p><strong>Endereço:</strong> {lancamentoCompleto.cliente.logradouro}, {lancamentoCompleto.cliente.numero}</p>
                        <p><strong>Município:</strong> {lancamentoCompleto.cliente.municipio_id} - {lancamentoCompleto.cliente.uf_id}</p>
                    </div>
                )}

                {/* Detalhes das Parcelas */}
                {/* Detalhes das Parcelas */}
                <div className="parcelas-detalhes">
                    <h3>Parcelas</h3>
                    {lancamentoCompleto.parcelas.length > 0 ? (
                        <table className="parcelas-tabela">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Valor</th>
                                    <th>Vencimento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lancamentoCompleto.parcelas.map((parcela) => (
                                    <tr key={parcela.id}>
                                        <td>{parcela.descricao}</td>
                                        <td>R$ {parcela.valor_parcela.toFixed(2)}</td>
                                        <td>{formatarData(parcela.vencimento)}</td>
                                        <td>{parcela.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>Nenhuma parcela encontrada.</p>
                    )}
                </div>
                {/* Detalhes da Nota Fiscal */}
                {lancamentoCompleto.notaFiscal && (
                    <div className="nota-fiscal-detalhes">
                        <h3>Nota Fiscal</h3>
                        <p><strong>Número:</strong> {lancamentoCompleto.notaFiscal.nNF}</p>
                        <p><strong>Valor Total:</strong> R$ {lancamentoCompleto.notaFiscal.vNF}</p>
                        <p><strong>Data de Emissão:</strong> {formatarData(lancamentoCompleto.notaFiscal.dhEmi)}</p>
                        <p><strong>Status:</strong> {lancamentoCompleto.notaFiscal.status}</p>
                    </div>
                )}
                <div id='button-group'>
                    <button className="button-excluir" onClick={handleCancelar}>
                        Excluir
                    </button>
                </div>
            </div>
            {isConfirmDialogOpen && (
                <ConfirmarLancarParcelas
                    isOpen={isConfirmDialogOpen}
                    message={mensagem}
                    cancelarLancto={cancelarLancto}
                    onConfirmar={handleConfirmCancelamento}
                    onConfirm={handleConfirmCancelamento}  // Abre o modal de lançamento de parcelas
                    onCancel={() => setIsConfirmDialogOpen(false)}
                />
            )
            }
        </div>
    );
};

export default ModalLancamentoCompleto;