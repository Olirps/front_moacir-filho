import React, { useState, useEffect } from 'react';
import '../styles/ModalCadastroContasBancarias.css';
import { addContabancaria, getAllBancos } from '../services/api';
import Toast from '../components/Toast';

const ModalCadastroContasBancarias = ({ isOpen, onClose, isEdit, onSubmit, conta }) => {
    const [bancoId, setBancoId] = useState('');
    const [nome, setNome] = useState('');
    const [agencia, setAgencia] = useState('');
    const [numero, setNumero] = useState('');
    const [bancos, setBancos] = useState([]);
    const [tipoconta, setTipoConta] = useState('');
    const [documento, setDocumento] = useState('');
    const [toast, setToast] = useState({ message: '', type: '' });

    useEffect(() => {
        if (conta) {
            setBancoId(conta.bancoId || '');
            setAgencia(conta.agencia || '');
            setNumero(conta.numero || '');
        } else {
            setBancoId('');
            setAgencia('');
            setNumero('');
        }
    }, [conta]);

    useEffect(() => {
        const fetchBancos = async () => {
            try {
                const response = await getAllBancos();
                setBancos(response.data);
            } catch (err) {
                console.error('Erro ao buscar bancos', err);
            }
        };
        fetchBancos();
    }, []);

    if (!isOpen) return null;

    const handleBancoChange = (e) => setBancoId(e.target.value);
    const handleAgenciaChange = (e) => setAgencia(e.target.value);
    const handleNumeroChange = (e) => setNumero(e.target.value);
    const handleNomeChange = (e) => setNome(e.target.value);
    const handleDocumentoChange = (e) => setDocumento(e.target.value);
    const handleTipoContaChange = (e) => setTipoConta(e.target.value);

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{isEdit ? 'Editar Conta Bancária' : 'Cadastrar Conta Bancária'}</h2>
                <form onSubmit={onSubmit}>
                    <div id='cadastro-padrao'>
                        <div>
                            <label htmlFor="banco">Banco</label>
                            <select
                                className='input-geral'
                                id="banco"
                                name="bancoId"
                                value={bancoId}
                                onChange={handleBancoChange}
                                required
                            >
                                <option value="">Selecione o Banco</option>
                                {bancos.map((banco) => (
                                    <option key={banco.id} value={banco.id}>
                                        {banco.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="nome">Nome</label>
                            <input
                                className='input-geral'
                                type="text"
                                id="nome"
                                name="nome"
                                value={nome}
                                onChange={handleNomeChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="agencia">Agência</label>
                            <input
                                className='input-geral'
                                type="text"
                                id="agencia"
                                name="agencia"
                                value={agencia}
                                onChange={handleAgenciaChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="numero">Número da Conta</label>
                            <input
                                className='input-geral'
                                type="text"
                                id="numero"
                                name="numero"
                                value={numero}
                                onChange={handleNumeroChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="tipoconta">Tipo de Conta</label>
                            <select
                                className='input-geral'
                                id="tipoconta"
                                name="tipoconta"
                                value={tipoconta}
                                onChange={handleTipoContaChange}
                                required
                            >
                                <option value="">Selecione o Tipo de Conta</option>
                                <option value="corrente">Corrente</option>
                                <option value="poupanca">Poupança</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="documento">Documento</label>
                            <input
                                className='input-geral'
                                type="text"
                                id="documento"
                                name="documento"
                                value={documento}
                                onChange={handleDocumentoChange}
                                required
                            />
                        </div>
                        <div id='botao-salva'>
                            <button type="submit" id="btnsalvar" className="button">Salvar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalCadastroContasBancarias;
