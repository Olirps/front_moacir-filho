import React, { useEffect, useState } from 'react';
import '../styles/ModalCadastroFornecedor.css'; // Certifique-se de criar este CSS também
import { cpfCnpjMask } from './utils';

const ModalCadastroFornecedor = ({ isOpen, onClose, isEdit, onSubmit, fornecedor }) => {
  const [tipofornecedor, setTipoFornecedor] = useState('');
  const [nome, setNome] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [fornecedorContato, setfornecedorContato] = useState('');
  const [cpfCnpj, setCpf] = useState('');
  const [inscricaoestadual, setInscricaoEstadual] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');


  // Lista fixa de tipos de fornecedor
  const tiposFornecedor = [
    { id: 'maquinario', nome: 'Maquinário' },
    { id: 'peça', nome: 'Peça' },
    { id: 'servico', nome: 'Serviço' },
    { id: 'suplemento', nome: 'Suplemento' },
    { id: 'transporte', nome: 'Transporte' },
  ];

  useEffect(() => {
    if (fornecedor) {
      // Preencher os campos com os dados da pessoa selecionada para edição
      setTipoFornecedor(fornecedor.tipo_fornecedor || '');
      setNome(fornecedor.nome || '');
      setNomeFantasia(fornecedor.nomeFantasia || '');
      setfornecedorContato(fornecedor.fornecedor_contato || '');
      setCpf(fornecedor.cpfCnpj || '');
      setInscricaoEstadual(fornecedor.inscricaoestadual || '');
      setEmail(fornecedor.email || '');
      setCelular(fornecedor.celular || '');
      setLogradouro(fornecedor.logradouro || '');
      setNumero(fornecedor.numero || '');
      setBairro(fornecedor.bairro || '');
      setMunicipio(fornecedor.municipio || '');
      setUf(fornecedor.uf || '');
      setCep(fornecedor.cep || '');
    } else {
      // Limpar os campos quando não há pessoa selecionada
      setTipoFornecedor('');
      setNome('');
      setNomeFantasia('');
      setfornecedorContato('');
      setCpf('');
      setInscricaoEstadual('');
      setEmail('');
      setCelular('');
      setLogradouro('');
      setNumero('');
      setBairro('');
      setMunicipio('');
      setUf('');
      setCep('');

    }
  }, [fornecedor]);

  if (!isOpen) return null;

  const handleCpfChange = (e) => {
    const { value } = e.target;
    setCpf(cpfCnpjMask(value)); // Aplica a máscara ao CPF e atualiza o estado
  };

  const handleInscricaoEstadualChange = (e) => {
    const { value } = e.target;
    setInscricaoEstadual(value); // Aplica a máscara ao CPF e atualiza o estado
  };

  const handleNomeChange = (e) => {
    setNome(e.target.value); // Atualiza o estado do nome
  };

  const handleNomeFantasiaChange = (e) => {
    setNomeFantasia(e.target.value); // Atualiza o estado do nome
  };
  const handleFornecedorContatoChange = (e) => {
    setfornecedorContato(e.target.value); // Atualiza o estado do nome
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value); // Atualiza o estado do email
  };

  const handleCelularChange = (e) => {
    setCelular(e.target.value); // Atualiza o estado do email
  };

  const handleLogradouroChange = (e) => {
    setLogradouro(e.target.value); // Atualiza o estado do logradouro
  };

  const handleNumeroChange = (e) => {
    setNumero(e.target.value); // Atualiza o estado do número
  };

  const handleBairroChange = (e) => {
    setBairro(e.target.value); // Atualiza o estado do bairro
  };

  const handleMunicipioChange = (e) => {
    setMunicipio(e.target.value); // Atualiza o estado do município
  };

  const handleUfChange = (e) => {
    setUf(e.target.value); // Atualiza o estado do UF
  };

  const handleCepChange = (e) => {
    setCep(e.target.value); // Atualiza o estado do CEP
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{isEdit ? 'Editar Fornecedor' : 'Cadastrar Cadastro de Fornecedor'}</h2>
        <form onSubmit={onSubmit}>
          <div id='cadastro-padrão'>
            <div>
              <label htmlFor="tipofornecedor">Selecione um Tipo de Fornecedor:</label>
              <select
                id="tipofornecedor"
                name="tipofornecedor"
                value={tipofornecedor}
                onChange={(e) => setTipoFornecedor(e.target.value)}
                required
              >
                <option value="">Selecione um Tipo</option>
                {tiposFornecedor.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nome}
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
                onChange={handleNomeChange} // Adiciona o onChange para atualizar o estado
                maxLength="150"
                required
              />
            </div>
            <div>
              <label htmlFor="nome">Nome Fantasia</label>
              <input
                className='input-geral'
                type="text"
                id="nomeFantasia"
                name="nomeFantasia"
                value={nomeFantasia}
                onChange={handleNomeFantasiaChange} // Adiciona o onChange para atualizar o estado
                maxLength="150"
              />
            </div>
            <div>
              <label htmlFor="fornecedorContato">Contato Fornecedor</label>
              <input
                className='input-geral'
                type="text"
                id="fornecedorContato"
                name="fornecedorContato"
                value={fornecedorContato}
                onChange={handleFornecedorContatoChange} // Adiciona o onChange para atualizar o estado
                maxLength="150"
                required
              />
            </div>
            <div>
              <label htmlFor="cpfCnpj">CPF/CNPJ</label>
              <input
                className='input-geral'
                type="text"
                id="cpfCnpj"
                name="cpfCnpj"
                value={cpfCnpjMask(cpfCnpj)} // Controlado pelo estado
                onChange={handleCpfChange}
                disabled={isEdit}
                required
              />
              {isEdit && <input type="hidden" name="cpfCnpj" value={cpfCnpj} />}

            </div>
            <div>
              <label htmlFor="inscricaoestadual">Inscrição Estadual</label>
              <input
                className='input-geral'
                type="text"
                id="inscricaoestadual"
                name="inscricaoestadual"
                value={inscricaoestadual} // Controlado pelo estado
                onChange={handleInscricaoEstadualChange}
              />
            </div>
            <div>
              <label htmlFor="email">Email</label>
              <input
                className='input-geral'
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleEmailChange} // Adiciona o onChange para atualizar o estado
                maxLength="50"
                required
              />
            </div>
            <div>
              <label htmlFor="celular">Celular</label>
              <input
                className='input-geral'
                type="text"
                id="celular"
                name="celular"
                value={celular}
                onChange={handleCelularChange} // Adiciona o onChange para atualizar o estado
                maxLength="150"
                required
              />
            </div>
            <div>
              <label htmlFor="logradouro">Logradouro</label>
              <input
                className='input-geral'
                type="text"
                id="logradouro"
                name="logradouro"
                value={logradouro}
                onChange={handleLogradouroChange}
                required
              />
            </div>
            <div>
              <label htmlFor="numero">Número</label>
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
              <label htmlFor="bairro">Bairro</label>
              <input
                className='input-geral'
                type="text"
                id="bairro"
                name="bairro"
                value={bairro}
                onChange={handleBairroChange}
                required
              />
            </div>
            <div>
              <label htmlFor="municipio">Município</label>
              <input
                className='input-geral'
                type="text"
                id="municipio"
                name="municipio"
                value={municipio}
                onChange={handleMunicipioChange}
                required
              />
            </div>
            <div>
              <label htmlFor="uf">UF</label>
              <input
                className='input-geral'
                type="text"
                id="uf"
                name="uf"
                value={uf}
                onChange={handleUfChange}
                required
              />
            </div>
            <div>
              <label htmlFor="cep">CEP</label>
              <input
                className='input-geral'
                type="text"
                id="cep"
                name="cep"
                value={cep}
                onChange={handleCepChange}
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

export default ModalCadastroFornecedor;
