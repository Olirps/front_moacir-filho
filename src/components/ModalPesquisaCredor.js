import React, { useState, useEffect } from 'react';
import '../styles/ModalPesquisaCredor.css';
import Toast from '../components/Toast';
import { getFornecedores, getFuncionarios, getClientes } from '../services/api';  // Funções de consulta

const ModalPesquisaCredor = ({ isOpen, onClose, onSelectCredito }) => {
    const [tipoCredito, setTipoCredito] = useState('fornecedor'); // Estado para o tipo de crédito selecionado
    const [funcionarioInputs, setFuncionarioInputs] = useState({ nome: '', cpf: '' });
    const [fornecedorInputs, setFornecedorInputs] = useState({ razaoSocial: '', nomeFantasia: '', cnpj: '' });
    const [clienteInputs, setClienteInputs] = useState({ razaoSocial: '', nomeFantasia: '', cpfCnpj: '' });
    const [resultados, setResultados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    

    useEffect(() => {
        if (isOpen) {
            setFuncionarioInputs({ nome: '', cpf: '' });
            setFornecedorInputs({ razaoSocial: '', nomeFantasia: '', cnpj: '' });
            setClienteInputs({ razaoSocial: '', nomeFantasia: '', cpfCnpj: '' });
            setResultados([]);
        }
    }, [isOpen]);

    const handleSearch = async () => {
        setLoading(true);
        try {
            let response;
            switch (tipoCredito) {
                case 'fornecedor':
                    response = await getFornecedores(fornecedorInputs); // Pesquisa fornecedores
                    break;
                case 'funcionario':
                    response = await getFuncionarios(funcionarioInputs); // Pesquisa funcionários
                    break;
                case 'cliente':
                    response = await getClientes(clienteInputs); // Pesquisa clientes
                    break;
                default:
                    break;
            }
            setResultados(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Erro na pesquisa', err);
            setToast({ message: "Erro ao buscar créditos.", type: "error" });
            setLoading(false);
        }
    };

    const handleSelect = (credito) => {
        onSelectCredito(credito);  // Envia o item selecionado para o pai
        onClose();  // Fecha o modal
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Pesquisar Crédito</h2>

                <div>
                    <label htmlFor="fornecedor">Fornecedor</label>
                    <input
                        type="radio"
                        id="fornecedor"
                        name="tipoCredito"
                        value="fornecedor"
                        checked={tipoCredito === 'fornecedor'}
                        onChange={() => setTipoCredito('fornecedor')}
                    />
                    <label htmlFor="funcionario">Funcionário</label>
                    <input
                        type="radio"
                        id="funcionario"
                        name="tipoCredito"
                        value="funcionario"
                        checked={tipoCredito === 'funcionario'}
                        onChange={() => setTipoCredito('funcionario')}
                    />
                    <label htmlFor="cliente">Cliente</label>
                    <input
                        type="radio"
                        id="cliente"
                        name="tipoCredito"
                        value="cliente"
                        checked={tipoCredito === 'cliente'}
                        onChange={() => setTipoCredito('cliente')}
                    />
                </div>

                {tipoCredito === 'funcionario' && (
                    <div id='cadastro-padrao'>
                        <label>Nome</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={funcionarioInputs.nome}
                            onChange={(e) => setFuncionarioInputs({ ...funcionarioInputs, nome: e.target.value })}
                            placeholder="Digite o nome"
                        />
                        <label>CPF</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={funcionarioInputs.cpf}
                            onChange={(e) => setFuncionarioInputs({ ...funcionarioInputs, cpf: e.target.value })}
                            placeholder="Digite o CPF"
                        />
                    </div>
                )}

                {tipoCredito === 'fornecedor' && (
                    <div id='cadastro-padrao'>
                        <label>Razão Social</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={fornecedorInputs.razaoSocial}
                            onChange={(e) => setFornecedorInputs({ ...fornecedorInputs, razaoSocial: e.target.value })}
                            placeholder="Digite a Razão Social"
                        />
                        <label>Nome Fantasia</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={fornecedorInputs.nomeFantasia}
                            onChange={(e) => setFornecedorInputs({ ...fornecedorInputs, nomeFantasia: e.target.value })}
                            placeholder="Digite o Nome Fantasia"
                        />
                        <label>CNPJ</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={fornecedorInputs.cnpj}
                            onChange={(e) => setFornecedorInputs({ ...fornecedorInputs, cnpj: e.target.value })}
                            placeholder="Digite o CNPJ"
                        />
                    </div>
                )}

                {tipoCredito === 'cliente' && (
                    <div id='cadastro-padrao'>
                        <label>Nome/Razão Social</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={clienteInputs.razaoSocial}
                            onChange={(e) => setClienteInputs({ ...clienteInputs, razaoSocial: e.target.value })}
                            placeholder="Digite o Nome ou Razão Social"
                        />
                        <label>Nome Fantasia</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={clienteInputs.nomeFantasia}
                            onChange={(e) => setClienteInputs({ ...clienteInputs, nomeFantasia: e.target.value })}
                            placeholder="Digite o Nome Fantasia"
                        />
                        <label>CPF/CNPJ</label>
                        <input
                            className='input-geral'
                            type="text"
                            value={clienteInputs.cpfCnpj}
                            onChange={(e) => setClienteInputs({ ...clienteInputs, cpfCnpj: e.target.value })}
                            placeholder="Digite o CPF ou CNPJ"
                        />
                    </div>
                )}

                <button className="button" onClick={handleSearch}>Pesquisar</button>

                {loading && <div className="spinner-container"><div className="spinner"></div></div>}

                <ul>
                    {resultados.map((item) => (
                        <li key={item.id} onClick={() => handleSelect(item)}>
                            {item.nome} (ID: {item.id})
                        </li>
                    ))}
                </ul>
            </div>
            {toast.message && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
};

export default ModalPesquisaCredor;