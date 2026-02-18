import React, { useState, useEffect } from 'react';
import '../styles/ModalEditarDataPagamento.css';
import Toast from './Toast';
import { formatarData } from '../utils/functions';

const ModalEditarDataPagamento = ({ isOpen, onClose, onSubmit, conta }) => {
    const [dataPagamento, setDataPagamento] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        if (conta && isOpen) {
            // Converte a data do formato ISO para YYYY-MM-DD
            const dataFormatada = conta.data_pagamento 
                ? new Date(conta.data_pagamento).toISOString().split('T')[0]
                : '';
            setDataPagamento(dataFormatada);
        }
    }, [conta, isOpen]);

    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!dataPagamento) {
            setToast({ message: 'Por favor, informe a data de pagamento.', type: 'error' });
            return;
        }

        const dataAtual = new Date();
        dataAtual.setHours(0, 0, 0, 0);
        const dataInformada = new Date(dataPagamento);
        dataInformada.setHours(0, 0, 0, 0);

        if (dataInformada > dataAtual) {
            setToast({ message: 'A data de pagamento não pode ser maior que a data atual.', type: 'error' });
            return;
        }

        onSubmit(dataPagamento);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Editar Data de Pagamento</h2>
                <form onSubmit={handleSubmit}>
                    <div id='cadastro-padrao'>
                        <div>
                            <label>Credor:</label>
                            <p className="info-text">{conta?.credor_nome || '-'}</p>
                        </div>
                        <div>
                            <label>Descrição:</label>
                            <p className="info-text">{conta?.descricao || '-'}</p>
                        </div>
                        <div>
                            <label>Data de Pagamento Atual:</label>
                            <p className="info-text">{conta?.data_pagamento ? formatarData(conta.data_pagamento) : '-'}</p>
                        </div>
                        <div>
                            <label htmlFor="dataPagamento">Nova Data de Pagamento *</label>
                            <input
                                className='input-geral'
                                type="date"
                                id="dataPagamento"
                                name="dataPagamento"
                                value={dataPagamento}
                                onChange={(e) => setDataPagamento(e.target.value)}
                                required
                            />
                        </div>
                        <div id='button-group'>
                            <button type="submit" className="button">Salvar</button>
                            <button type="button" className="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </div>
                </form>
                {toast.message && <Toast message={toast.message} type={toast.type} />}
            </div>
        </div>
    );
};

export default ModalEditarDataPagamento;
