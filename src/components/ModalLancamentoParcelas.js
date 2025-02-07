import React, { useState, useEffect } from 'react';
import '../styles/ModalLancamentoParcelas.css';
import Toast from '../components/Toast';

const ModalLancamentoParcelas = ({ isOpen, onSubmit,onClose, valorTotal, despesa, onSave }) => {
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
    const [vencimento, setVencimento] = useState(new Date().toISOString().split('T')[0]);
    const [valorEntrada, setValorEntrada] = useState(0);
    const [parcelas, setParcelas] = useState([]);
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        calcularParcelas();
    }, [quantidadeParcelas, vencimento, valorEntrada, valorTotal]);

    const calcularParcelas = () => {
        const entrada = parseFloat(valorEntrada) || 0;
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
                <h2>Lançamento de Parcelas</h2>
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Quantidade de Parcelas:</label>
                        <input
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
                            type="date"
                            name='vencimento'
                            value={vencimento}
                            onChange={(e) => setVencimento(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Valor de Entrada:</label>
                        <input
                            type="text"
                            value={valorEntrada}
                            name='valorEntrada'
                            onChange={(e) => setValorEntrada(e.target.value.replace(',', '.'))}
                            min="0"
                            step="0.01"
                        />
                    </div>
                    {parcelas.length > 0 && (
                        <div className="parcelas-table">
                            <h3>Parcelas Geradas</h3>
                            <table>
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
                                            <td>{parcela.valor.toFixed(2)}</td>
                                            <td>{parcela.dataVencimento}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
