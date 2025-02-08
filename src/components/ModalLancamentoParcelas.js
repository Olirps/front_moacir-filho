import React, { useState, useEffect } from 'react';
import '../styles/ModalLancamentoParcelas.css';
import Toast from '../components/Toast';
import {formatarMoedaBRL,converterMoedaParaNumero } from '../utils/functions';


const ModalLancamentoParcelas = ({ isOpen, onSubmit, onClose, valorTotal, despesa, onSave }) => {
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
    const [vencimento, setVencimento] = useState(new Date().toISOString().split('T')[0]);
    const [valorEntrada, setValorEntrada] = useState(0);
    const [parcelas, setParcelas] = useState([]);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        calcularParcelas();
    }, [quantidadeParcelas, vencimento, valorEntrada, valorTotal]);

    const calcularParcelas = () => {
        const entrada = converterMoedaParaNumero(valorEntrada) || 0;
        const restante = valorTotal - entrada;
        const valorBaseParcela = Math.floor((restante / quantidadeParcelas) * 100) / 100;
        let somaParcelas = valorBaseParcela * (quantidadeParcelas - 1);
        const valorAjustadoUltimaParcela = restante - somaParcelas;

        const novasParcelas = Array.from({ length: quantidadeParcelas }, (_, i) => {
            const dataVenc = new Date(vencimento);
            dataVenc.setMonth(dataVenc.getMonth() + i);
            return {
                numero: i + 1,
                valor: i === quantidadeParcelas - 1 ? valorAjustadoUltimaParcela : valorBaseParcela,
                dataVencimento: dataVenc.toISOString().split('T')[0],
            };
        });

        setParcelas(novasParcelas);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Lançamento de Parcelas - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}</h2>
                <form onSubmit={onSubmit}>
                    <div id='cadastro-padrao'>
                        <div className="form-group">
                            <label>Quantidade de Parcelas:</label>
                            <input
                                className='input-geral'
                                type="text"
                                value={quantidadeParcelas}
                                name='quantidadeParcelas'
                                onChange={(e) => setQuantidadeParcelas(Math.max(1, Number(e.target.value.replace(',', ''))))}
                                min="1"
                            />
                        </div>
                        <div className="form-group">
                            <label>Data de Vencimento:</label>
                            <input
                                className='input-geral'
                                type="date"
                                name='vencimento'
                                value={vencimento}
                                onChange={(e) => setVencimento(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor de Entrada:</label>
                            <input
                                className='input-geral'
                                type="text"
                                value={valorEntrada}
                                name='valorEntrada'
                                onChange={(e) => setValorEntrada(formatarMoedaBRL(e.target.value))}
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {parcelas.length > 0 && (
                        <div id="results-container">
                            <div id="grid-padrao-container">
                                <h3>Parcelas Geradas</h3>
                                <table id='grid-padrao'>
                                    <thead>
                                        <tr>
                                            <th>Parcela</th>
                                            <th>Valor</th>
                                            <th>Data de Vencimento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parcelas.map((parcela) => (
                                            <tr key={parcela.numero}>
                                                <td>{parcela.numero}</td>
                                                <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parcela.valor)}</td>
                                                <td>{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    <button type='submit' className="button-geral">Salvar Parcelas</button>
                </form>
                {toast.message && <Toast message={toast.message} type={toast.type} />}
            </div>
        </div>
    );
};

export default ModalLancamentoParcelas;
