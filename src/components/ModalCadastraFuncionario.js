import React, { useState, useEffect } from 'react';
import '../styles/ModalFuncionario.css';

function ModalFuncionario({ isOpen, onClose, onSubmit, funcionario, edit }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [cargo, setCargo] = useState('');
  const [endereco, setEndereco] = useState('');

  useEffect(() => {
    if (edit && funcionario) {
      setNome(funcionario.nome || '');
      setCpf(funcionario.cpf || '');
      setEmail(funcionario.email || '');
      setCelular(funcionario.celular || '');
      setCargo(funcionario.cargo || '');
      setEndereco(funcionario.endereco || '');
    } else {
      setNome('');
      setCpf('');
      setEmail('');
      setCelular('');
      setCargo('');
      setEndereco('');
    }
  }, [edit, funcionario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ nome, cpf, email, celular, cargo });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{edit ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h2>
        <form onSubmit={handleSubmit}>
          <div id='cadastro-padrao'>
            <label htmlFor="nome">Nome</label>
            <input
              className='input-geral'
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <label htmlFor="cpf">CPF</label>
            <input
              className='input-geral'
              type="text"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              required
            />
            <label htmlFor="email">Email</label>
            <input
              className='input-geral'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="celular">Celular</label>
            <input
              className='input-geral'
              type="text"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
            />
            <label htmlFor="cargo">Cargo</label>
            <input
              className='input-geral'
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
            />
            <label htmlFor="endereco">Endereço</label>
            <input
              className='input-geral'
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
            <div id='botao-salva'>
              <button id="btnsalvar" className="button" type="submit">Salvar</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalFuncionario;
