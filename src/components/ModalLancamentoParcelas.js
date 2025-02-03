import React, { useState, useEffect } from 'react';
import '../styles/ModalLancamentoParcelas.css'; // Crie um arquivo CSS para estilizar o modal
import Toast from '../components/Toast';

const ModalLancamentoParcelas = ({ isOpen, onClose, valorTotal, despesa, onSave }) => {
    const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
    const [vencimento, setVencimento] = useState(new Date().toISOString().split('T')[0]);
    const [valorEntrada, setValorEntrada] = useState('0');
    const [formaPagamento, setFormaPagamento] = useState('dinheiro');
    const [toast, setToast] = useState({ message: '', type: '' });
    const [parcelas, setParcelas] = useState([]);

    useEffect(() => {
        if (vencimento && quantidadeParcelas > 0) {
            const novasParcelas = [];
            const valorParcela = (despesa.valor - valorEntrada) / quantidadeParcelas;

            for (let i = 0; i < quantidadeParcelas; i++) {
                const dataVencimento = new Date(vencimento);
                dataVencimento.setMonth(dataVencimento.getMonth() + i);

                novasParcelas.push({
                    valor: valorParcela,
                    dataVencimento: dataVencimento.toISOString().split('T')[0],
                    formaPagamento,
                });
            }

            setParcelas(novasParcelas);
        }
    }, [quantidadeParcelas, vencimento, valorEntrada, formaPagamento, valorTotal]);

    const handleSave = () => {
        if (!vencimento || quantidadeParcelas < 1) {
            setToast({ message: "Preencha todos os campos obrigatórios.", type: "error" });
            return;
        }

        onSave(parcelas);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Lançar Parcelas</h2>
                <div className="form-group">
                    <label>Quantidade de Parcelas</label>
                    <input
                        type="number"
                        value={quantidadeParcelas}
                        onChange={(e) => setQuantidadeParcelas(Number(e.target.value))}
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Data de Vencimento</label>
                    <input
                        type="date"
                        value={vencimento}
                        onChange={(e) => setVencimento(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Valor de Entrada</label>
                    <input
                        type="text"
                        value={valorEntrada}
                        onChange={(e) => setValorEntrada(Number(e.target.value.replace(',','.')))}
                        min="0"
                    />
                </div>
                <div className="form-group">
                    <label>Forma de Pagamento</label>
                    <select
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                    >
                        <option value="transferencia">Transferência</option>
                        <option value="boleto">Boleto</option>
                        <option value="credito">Cartão de Crédito</option>
                        <option value="debito">Cartão de Débito</option>
                        <option value="dinheiro">Dinheiro</option>
                    </select>
                </div>
                <div className="form-group">
                    <button className="button-geral" onClick={handleSave}>Salvar Parcelas</button>
                </div>
                {toast.message && <Toast message={toast.message} type={toast.type} />}

                {parcelas.length > 0 && (
                    <div className="parcelas-table">
                        <h3>Parcelas Geradas</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Parcela</th>
                                    <th>Valor</th>
                                    <th>Data de Vencimento</th>
                                    <th>Forma de Pagamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parcelas.map((parcela, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{parcela.valor.toFixed(2)}</td>
                                        <td>{parcela.dataVencimento}</td>
                                        <td>{parcela.formaPagamento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModalLancamentoParcelas;