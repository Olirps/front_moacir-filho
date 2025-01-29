import React, { useState, useEffect } from 'react';
import '../styles/ModalFuncionario.css';

function ModalFuncionario({ isOpen, onClose, onSubmit, funcionario, edit }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [cargo, setCargo] = useState('');

  useEffect(() => {
    if (edit && funcionario) {
      setNome(funcionario.nome || '');
      setCpf(funcionario.cpf || '');
      setEmail(funcionario.email || '');
      setCelular(funcionario.celular || '');
      setCargo(funcionario.cargo || '');
    } else {
      setNome('');
      setCpf('');
      setEmail('');
      setCelular('');
      setCargo('');
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
        <h2>{edit ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          
          <label>CPF</label>
          <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required />
          
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          
          <label>Celular</label>
          <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} />
          
          <label>Cargo</label>
          <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} required />
          
          <div className="modal-buttons">
            <button type="submit">Salvar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalFuncionario;
