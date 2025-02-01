// src/components/Layout.js
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import '../styles/Layout.css';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/hasPermission'; // Importar a função para checar permissões

function Layout() {
  const { permissions } = useAuth(); // Pega as permissões do usuário

  const [username, setUser] = useState('');
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCadastrosOpen, setCadastrosOpen] = useState(false);
  const [isMovimentacaoOpen, setMovimentacaoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem('username');
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const toggleCadastros = () => {
    setCadastrosOpen(!isCadastrosOpen);
    setMovimentacaoOpen(false); // Fecha o submenu de movimentação
  };

  const toggleMovimentacao = () => {
    setMovimentacaoOpen(!isMovimentacaoOpen);
    setCadastrosOpen(false); // Fecha o submenu de cadastros
  };

  // Função que retorna true se o usuário tem permissão para visualizar o item de menu
  const canViewMenuItem = (pageName) => {
    return hasPermission(permissions, pageName, 'view');
  };

  return (
    <div>
      <header id="header">
        <div id="header-content">
          {/* Button to toggle the main menu */}
          <button id="menu-button" onClick={toggleMenu}>
            {isMenuOpen ? 'Fechar Menu' : 'Abrir Menu'}
          </button>
          {/* Main navigation menu */}
          <nav id="menu" className={isMenuOpen ? 'show' : ''}>
            {canViewMenuItem('home') && <Link to="/home" className="menu-item">Home</Link>}

            {/* Cadastros menu item with a submenu */}
            {canViewMenuItem('permissoes') || canViewMenuItem('clientes') || canViewMenuItem('funcionarios') || canViewMenuItem('fornecedores') || canViewMenuItem('produtos') || canViewMenuItem('veiculos') ? (
              <div id="cadastros" className="menu-item" onClick={toggleCadastros}>
                <span>Cadastros</span>
                <div id="cadastros-submenu" className={isCadastrosOpen ? 'submenu' : ''}>
                  {canViewMenuItem('permissoes') && <Link to="/permissoes" className="submenu-item">Permissões</Link>}
                  {canViewMenuItem('clientes') && <Link to="/clientes" className="submenu-item">Clientes</Link>}
                  {canViewMenuItem('funcionarios') && <Link to="/funcionarios" className="submenu-item">Funcionários</Link>}
                  {canViewMenuItem('fornecedores') && <Link to="/fornecedores" className="submenu-item">Fornecedores</Link>}
                  {canViewMenuItem('produtos') && <Link to="/produtos" className="submenu-item">Produtos/Serviços</Link>}
                  {canViewMenuItem('veiculos') && <Link to="/veiculos" className="submenu-item">Veículos</Link>}
                </div>
              </div>
            ) : null}

            {/* Movimentação menu item with a submenu */}
            {canViewMenuItem('notafiscal') || canViewMenuItem('movimentacaoprodutos') ? (
              <div id="movimentacao" className="menu-item" onClick={toggleMovimentacao}>
                <span>Movimentação</span>
                <div id="movimentacao-submenu" className={isMovimentacaoOpen ? 'submenu' : ''}>
                  {canViewMenuItem('notafiscal') && <Link to="/notafiscal" className="submenu-item">Lançar NF-e</Link>}
                  {canViewMenuItem('movimentacaoprodutos') && <Link to="/movimentacaoprodutos" className="submenu-item">Movimentação de Produtos</Link>}
                </div>
              </div>
            ) : null}
          </nav>
          {/* User information and logout button */}
          <div id="user-info">
            <div>
              <span id="usuario">{`Bem vindo ${username.toUpperCase()}`}</span>
            </div>
            <div>
              <button onClick={handleLogout} id="logout-button">Sair</button>
            </div>
          </div>
        </div>
      </header>
      {/* Main content area */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
