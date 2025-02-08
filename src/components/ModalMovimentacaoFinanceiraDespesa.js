import React, { useState, useEffect } from 'react';
import '../styles/ModalMovimentacaoFinanceiraDespesa.css';
import Toast from '../components/Toast';
import {formatarMoedaBRL } from '../utils/functions';
import ConfirmarLancarParcelas from '../components/ConfirmarLancarParcelas'; // Importando o novo modal
import ModalPesquisaCredor from '../components/ModalPesquisaCredor'; // Importando o modal de pesquisa
import ModalLancamentoParcelas from '../components/ModalLancamentoParcelas'; // Importe o novo modal

const ModalMovimentacaoFinanceiraDespesa = ({ isOpen, onConfirmar ,onSubmit, edit, onClose, movimentacao, onSuccess }) => {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [tipoCredor, setTipoCredor] = useState('');
    const [dataLancamento, setDataLancamento] = useState(new Date().toISOString().split('T')[0]);
    const [dataVencimento, setDataVencimento] = useState('');
    const [tipo, setTipo] = useState('debito');  // Tipo de movimentação (crédito ou débito)
    const [despesaAdicionada, setDespesaAdicionada] = useState('');  // Tipo de movimentação (crédito ou débito)
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: '' });
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [mensagem, setMensagem] = useState('');
    const [isModalPesquisaOpen, setIsModalPesquisaOpen] = useState(false);  // Controle do Modal de Pesquisa
    const [credorSelecionado, setCredorSelecionado] = useState(null);  // Crédito selecionado do Modal de Pesquisa
    const [lancarParcelas, setLancarParcelas] = useState(''); // Estado para controlar a opção de parcelamento
    const [isModalParcelasOpen, setIsModalParcelasOpen] = useState(false); // Estado para controlar o modal de parcelas
    const [cancelarLancto, setCancelarLancto] = useState(false); // Estado para controlar o modal de parcelas
    const [despesaRecorrente, setDespesaRecorrente] = useState('cotaunica'); // Estado para controlar o modal de parcelas
    const [valorEntradaDespesa, setValorEntradaDespesa] = useState(''); // Estado para controlar o modal de parcelas
    //  const [valorRestante, setValorParcelaArredondado] = useState(''); // Estado para controlar o modal de parcelas
    //  const [valorParcelaArredondado, setValorParcelaArredondado] = useState(''); // Estado para controlar o modal de parcelas

    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    useEffect(() => {
        if (isOpen) {
            // Reseta os estados quando o modal é aberto
            if (movimentacao?.id && edit) {
                setDescricao(movimentacao.descricao || '');
                setValor(String(movimentacao.valor || '')); // Convertendo para string
                setDataVencimento(movimentacao.data_vencimento || '');
                setTipo(movimentacao.tipo || 'debito'); // Garante que o tipo esteja correto

                // Verifica o tipo de credor e define o estado adequado
                if (movimentacao.funcionario_id) {
                    setCredorSelecionado(movimentacao.funcionario.cliente);
                } else if (movimentacao.fornecedor_id) {
                    setCredorSelecionado(movimentacao.fornecedor);
                } else if (movimentacao.cliente_id) {
                    setCredorSelecionado(movimentacao.cliente);
                }
                setLoading(false);

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

    const handleTipoCredor = (tipo) => {
        setTipoCredor(tipo); // Aqui, o tipo de credor é atualizado no estado do componente pai
    };

    const handleLancaParcelas = () => {
        setIsModalParcelasOpen(true)
    }

    const handleCancelar = () => {
        if (!movimentacao) return;
        setCancelarLancto(true)
        setMensagem('Deseja realmente excluir esta despesa?')
        setIsConfirmDialogOpen(true);
    };

    const handleConfirmCancelamento = async () => {
        onConfirmar(movimentacao);
    }

    const handleSaveParcelas = (parcelas) => {
        // Aqui você pode enviar as parcelas para o backend ou processá-las conforme necessário
        setToast({ message: "Parcelas salvas com sucesso!", type: "success" });
        onSuccess();
        onClose();
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
                        <form onSubmit={onSubmit}>
                            <div id='cadastro-padrao'>
                                <div>
                                    <label>Credor</label>
                                    <input type="hidden" name="tipoCredor" value={tipoCredor} />
                                    <input type="hidden" name="credorSelecionado" value={credorSelecionado?.id} />
                                    <input
                                        type="text"
                                        className="input-geral"
                                        name='credorSelecionado'
                                        value={credorSelecionado ? (credorSelecionado.nome || credorSelecionado.cliente?.nome) : ""}
                                        onClick={handleOpenPesquisaCredito}
                                        readOnly
                                        placeholder="Selecionar Credor"
                                        required
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label htmlFor="descricao">Descrição</label>
                                    <input
                                        className='input-geral'
                                        type="text"
                                        name='descricao'
                                        value={descricao.toUpperCase()}
                                        onChange={(e) => setDescricao(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="valor">Valor</label>
                                    <input
                                        className='input-geral'
                                        type="text"
                                        value={valor} // Isso funcionará, pois `valor` é uma string
                                        name='valor' // Isso funcionará, pois `valor` é uma string

                                        onChange={(e) => { setValor(formatarMoedaBRL(e.target.value)) }} //forma resumida de atualizar o input

                                        required
                                    />
                                </div>
                                <div>
                                    <label>Data de Vencimento</label>
                                    <input
                                        className='input-geral'
                                        type="date"
                                        value={dataVencimento}
                                        name='dataVencimento'
                                        onChange={(e) => setDataVencimento(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label>Tipo</label>
                                    <select
                                        className='input-geral'
                                        value={tipo}
                                        name='tipo'
                                        onChange={(e) => setTipo(e.target.value)}
                                        required>
                                        <option value="debito">Débito</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <div>
                                    <label>Tipo de Despesa</label>
                                    <div>
                                        <label>
                                            <input
                                                type="radio"
                                                value="cotaunica"
                                                name='despesaRecorrente'
                                                checked={despesaRecorrente === 'cotaunica'}
                                                onChange={() => setDespesaRecorrente('cotaunica')}
                                            />
                                            Cota Única
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                value="recorrente"
                                                name='despesaRecorrente'
                                                checked={despesaRecorrente === 'recorrente'}
                                                onChange={() => setDespesaRecorrente('recorrente')}
                                            />
                                            Recorrente
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                value="parcelada"
                                                name='despesaRecorrente'
                                                checked={despesaRecorrente === 'parcelada'}
                                                onChange={() => {
                                                    setDespesaRecorrente('parcelada')
                                                    setLancarParcelas('')
                                                }
                                                }
                                            />
                                            Parcelada
                                        </label>
                                    </div>
                                </div>

                                {/* Exibe campos de despesa parcelada */}
                                {despesaRecorrente === 'parcelada' && (
                                    <>
                                        <div>
                                            <label>Quantidade de Parcelas</label>
                                            <input
                                                className='input-geral'
                                                type="number"
                                                name='lancarParcelas'
                                                value={lancarParcelas}
                                                onChange={(e) => {
                                                    // Remove qualquer caractere que não seja um número inteiro
                                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                                    // Converte o valor para número inteiro
                                                    const intValue = parseInt(value, 10);
                                                    // Define o valor mínimo como 1
                                                    setLancarParcelas(Math.max(1, intValue || 0));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label>Vencimento da Primeira Parcela</label>
                                            <input
                                                className='input-geral'
                                                type="date"
                                                name='dataLancamento'
                                                value={dataLancamento}
                                                onChange={(e) => setDataLancamento(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label>Valor de Entrada</label>
                                            <input
                                                className='input-geral'
                                                type="text"
                                                name='valorEntradaDespesa'
                                                value={valorEntradaDespesa}
                                                onChange={(e) => setValorEntradaDespesa(formatarMoedaBRL(e.target.value))}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                {/* Exibir parcelas em tela após inserção */}
                                {despesaRecorrente === 'parcelada' && lancarParcelas && dataLancamento && (
                                    <div>
                                        <h3>Parcelas</h3>
                                        <div className="parcelas-container">
                                            {(() => {
                                                // Ensure valorEntrada is initialized with a default value if not provided
                                                const valorEntrada = parseFloat((valorEntradaDespesa || '0').replace(',', '.')); // Default to 0 if undefined
                                                const valorTotal = parseFloat(valor.replace(',', '.')); // Valor total da despesa
                                                const valorRestante = valorTotal - valorEntrada; // Calcula o valor restante após a entrada

                                                const valorParcela = valorRestante / parseInt(lancarParcelas); // Dividimos o valor restante pelas parcelas
                                                const valorParcelaArredondado = parseFloat(valorParcela.toFixed(2)); // Arredondamos para 2 casas decimais

                                                return Array.from({ length: parseInt(lancarParcelas) }, (_, index) => {
                                                    // Ensure dataLancamento is a valid date
                                                    const dataLancamentoDate = new Date(dataLancamento);
                                                    if (isNaN(dataLancamentoDate.getTime())) {
                                                        console.error('Invalid dataLancamento:', dataLancamento);
                                                        return null; // or handle the error appropriately
                                                    }

                                                    // Calculando a data de vencimento de cada parcela (acrescentando 30 dias para cada uma)
                                                    const dataVencimentoParcela = new Date(dataLancamentoDate);
                                                    dataVencimentoParcela.setMonth(dataVencimentoParcela.getMonth() + index); // Para aumentar um mês para cada parcela

                                                    // Handle month overflow
                                                    if (dataVencimentoParcela.getMonth() !== (dataLancamentoDate.getMonth() + index) % 12) {
                                                        dataVencimentoParcela.setFullYear(dataLancamentoDate.getFullYear() + Math.floor((dataLancamentoDate.getMonth() + index) / 12));
                                                    }

                                                    const valorRestanteNaUltima = index === parseInt(lancarParcelas) - 1
                                                        ? (valorRestante - valorParcelaArredondado * (parseInt(lancarParcelas) - 1))
                                                        : 0; // Calculando o "resto" para a última parcela

                                                    return (
                                                        <div key={index} className="parcela">
                                                            <span>{`Parcela ${index + 1}`}</span>
                                                            <span>
                                                                <label>Vencimento</label>
                                                                <input
                                                                    type="date"
                                                                    name='dataVencimentoParcela'
                                                                    value={dataVencimentoParcela.toISOString().split('T')[0]} // Formata a data para o padrão YYYY-MM-DD
                                                                    readOnly
                                                                />
                                                            </span>
                                                            <span>
                                                                <label>Valor</label>
                                                                <input
                                                                    type="number"
                                                                    name='lancarParcelas'
                                                                    value={index === parseInt(lancarParcelas) - 1 && valorRestanteNaUltima > 0 ? valorRestanteNaUltima.toFixed(2) : valorParcelaArredondado.toFixed(2)} // Valor da parcela com o "resto" adicionado
                                                                    readOnly
                                                                />
                                                            </span>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
                                <div id='button-group'>
                                    <button type="submit"
                                        className="button-geral"
                                    >
                                        Salvar
                                    </button>
                                    {movimentacao &&
                                        <button className="button-excluir" onClick={handleCancelar}>
                                            Excluir
                                        </button>}
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </div>
            {toast.message && <Toast message={toast.message} type={toast.type} />}
            {isConfirmDialogOpen && (
                <ConfirmarLancarParcelas
                    isOpen={isConfirmDialogOpen}
                    message={mensagem}
                    cancelarLancto={cancelarLancto}
                    onConfirmar={handleConfirmCancelamento}
                    onConfirm={cancelarLancto ? handleConfirmCancelamento : handleLancaParcelas}  // Abre o modal de lançamento de parcelas
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