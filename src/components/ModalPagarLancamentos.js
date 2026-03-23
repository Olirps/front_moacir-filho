import React, { useState, useEffect } from 'react';
import '../styles/ModalPagarLancamentos.css';
import Toast from '../components/Toast';
import { converterMoedaParaNumero, formatarMoedaBRL } from '../utils/functions';
import { getAllContas } from '../services/api';

const ModalPagarLancamentos = ({ isOpen, onSubmit, onClose, parcela }) => {
    const [contas, setContas] = useState([]);
    const [contabancaria, setContaBancaria] = useState('');
    const [datapagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
    const [acrescimo, setAcrescimo] = useState('R$ 0,00');
    const [desconto, setDesconto] = useState('R$ 0,00');
    const [valorPago, setValorPago] = useState('R$ 0,00');
    const [formaPagamento, setFormaPagamento] = useState('dinheiro');
    const [boleto, setBoleto] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });
    const [valorPagoAlteradoManualmente, setValorPagoAlteradoManualmente] = useState(false);

    const valorOriginalParcela = (Number(parcela?.valor_parcela || '0'));
    const acrescimoNumero = converterMoedaParaNumero(String(acrescimo || '0'));
    const descontoNumero = converterMoedaParaNumero(String(desconto || '0'));
    const valorFinal = valorOriginalParcela + acrescimoNumero - descontoNumero;
    const valorPagoNumero = converterMoedaParaNumero(String(valorPago || '0'));
    const pagamentoParcial = valorPagoNumero > 0 && valorPagoNumero < valorFinal;

    useEffect(() => {
        const fetchContas = async () => {
            try {
                const response = await getAllContas();
                setContas(response.data);
            } catch (err) {
                console.error('Erro ao buscar contas bancarias', err);
            }
        };

        fetchContas();
    }, []);

    useEffect(() => {
        setContaBancaria('');
        setFormaPagamento('dinheiro');
        setDataPagamento(new Date().toISOString().split('T')[0]);
        setAcrescimo('R$ 0,00');
        setDesconto('R$ 0,00');
        setBoleto(parcela?.boleto || '');
        setValorPagoAlteradoManualmente(false);
    }, [parcela]);

    useEffect(() => {
        if (!valorPagoAlteradoManualmente) {
            setValorPago(formatarMoedaBRL(valorFinal));
        }
    }, [valorFinal, valorPagoAlteradoManualmente]);

    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (acrescimoNumero < 0) {
            setToast({ message: 'Acrescimo deve ser maior ou igual a zero.', type: 'error' });
            return;
        }

        if (descontoNumero < 0) {
            setToast({ message: 'Desconto deve ser maior ou igual a zero.', type: 'error' });
            return;
        }

        if (descontoNumero > (valorOriginalParcela + acrescimoNumero)) {
            setToast({ message: 'Desconto nao pode ser maior que o total da parcela.', type: 'error' });
            return;
        }

        if (valorFinal <= 0) {
            setToast({ message: 'Valor final invalido. Verifique acrescimo e desconto.', type: 'error' });
            return;
        }

        if (valorPagoNumero <= 0) {
            setToast({ message: 'Informe um valor pago maior que zero.', type: 'error' });
            return;
        }

        const pagamento = {
            status: 'liquidado',
            data_pagamento: datapagamento,
            data_efetiva_pg: datapagamento,
            metodo_pagamento: formaPagamento,
            conta_id: contabancaria,
            boleto: boleto || null,
            valor_pago: valorPagoNumero,
            valorPago: valorPagoNumero,
            acrescimo: acrescimoNumero,
            desconto: descontoNumero
        };

        onSubmit(pagamento, {
            pagamentoParcial,
            valorFinal,
            valorOriginalParcela
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Pagamento de Parcelas</h2>
                <form onSubmit={handleSubmit}>
                    <div id='cadastro-padrao' className='resumo-parcela'>
                        <div>
                            <label>Valor original da parcela</label>
                            <input className='input-geral' type="text" value={formatarMoedaBRL(valorOriginalParcela)} readOnly />
                        </div>
                        <div>
                            <label>Acrescimo</label>
                            <input
                                className='input-geral'
                                type="text"
                                name='acrescimo'
                                value={acrescimo}
                                onChange={(e) => setAcrescimo(formatarMoedaBRL(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>Desconto</label>
                            <input
                                className='input-geral'
                                type="text"
                                name='desconto'
                                value={desconto}
                                onChange={(e) => setDesconto(formatarMoedaBRL(e.target.value))}
                            />
                        </div>
                        <div>
                            <label>Valor final</label>
                            <input className='input-geral' type="text" value={formatarMoedaBRL(valorFinal)} readOnly />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="contabancaria">Origem Pagamento</label>
                        <select
                            className='input-geral'
                            id="contabancaria"
                            name="contabancaria"
                            value={contabancaria}
                            onChange={(e) => setContaBancaria(e.target.value)}
                            required
                        >
                            <option value="">Selecione a Conta Bancaria</option>
                            {contas.map((conta) => (
                                <option key={conta.id} value={conta.id}>
                                    {conta.nome + ' ' + conta.agencia + ' ' + conta.conta}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Data do Pagamento</label>
                        <input
                            className='input-geral'
                            type='date'
                            value={datapagamento}
                            name='datapagamento'
                            onChange={(e) => setDataPagamento(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Valor Pago</label>
                        <input
                            className='input-geral'
                            type="text"
                            name='valorPago'
                            value={formatarMoedaBRL(valorPago)}
                            onChange={(e) => {
                                setValorPagoAlteradoManualmente(true);
                                setValorPago(formatarMoedaBRL(e.target.value));
                            }}
                        />
                    </div>
                    <div className="form-group">
                        <label>Boleto</label>
                        <input
                            className='input-geral'
                            type="text"
                            name='boleto'
                            value={boleto}
                            onChange={(e) => setBoleto(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Forma de Pagamento</label>
                        <select
                            className='input-geral'
                            value={formaPagamento}
                            name='formaPagamento'
                            onChange={(e) => setFormaPagamento(e.target.value)}
                            required>
                            <option value="transferencia">Transferencia</option>
                            <option value="boleto">Boleto</option>
                            <option value="credito">Cartao de Credito</option>
                            <option value="debito">Cartao de Debito</option>
                            <option value="cheque">Cheque</option>
                            <option value="DA">Debito Automatico</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="PIX">PIX</option>
                            <option value="TED">TED</option>
                            <option value="TRFCC">Transf. Entre CC</option>
                        </select>
                    </div>
                    {pagamentoParcial && (
                        <p className="parcial-alerta">
                            Pagamento parcial detectado. Sera gerada nova parcela para o proximo mes com o valor restante.
                        </p>
                    )}
                    <button type='submit' className="button-geral">Efetuar Pagamento</button>
                </form>
                {toast.message && <Toast message={toast.message} type={toast.type} />}
            </div>
        </div>
    );
};

export default ModalPagarLancamentos;
