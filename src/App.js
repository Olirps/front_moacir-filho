// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Fornecedores from './pages/Fornecedores';
import SubgrupoPage from './pages/SubgrupoPage';
import GrupoPage from './pages/GrupoPage';
import Produtos from './pages/Produtos';
import LancaNFe from './pages/LancaNFe';
import MovimentacaoProdutos from './pages/MovimentacaoProdutos';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';
import Veiculos from './pages/Veiculos';
import Clientes from './pages/Clientes';
import Funcionarios from './pages/Funcionarios';
import MovimentacaoFinanceiraDespesa from './pages/MovimentacaoFinanceiraDespesa';
import ContasBancarias from './pages/ContasBancarias';
import ContasPagas from './pages/ContasPagas';
import Permissoes from './pages/Permissoes';
import ContasPendentes from './pages/ContasPendentes';

import { hasPermission } from './utils/hasPermission'; // Importar a função

function App() {
  const { isAuthenticated, permissions } = useAuth(); // Pega o estado de autenticação e as permissões do usuário

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route
            path="/home"
            element={isAuthenticated && hasPermission(permissions, 'home', 'view') ? <Home /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/permissoes"
            element={isAuthenticated && hasPermission(permissions, 'permissoes', 'view') ? <Permissoes /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/clientes"
            element={isAuthenticated && hasPermission(permissions, 'clientes', 'view') ? <Clientes /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/funcionarios"
            element={isAuthenticated && hasPermission(permissions, 'funcionarios', 'view') ? <Funcionarios /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/fornecedores"
            element={isAuthenticated && hasPermission(permissions, 'fornecedores', 'view') ? <Fornecedores /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/grupoproduto"
            element={isAuthenticated && hasPermission(permissions, 'grupoproduto', 'view') ? <GrupoPage /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/subgrupoproduto"
            element={isAuthenticated && hasPermission(permissions, 'subgrupoproduto', 'view') ? <SubgrupoPage /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/produtos"
            element={isAuthenticated && hasPermission(permissions, 'produtos', 'view') ? <Produtos /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/veiculos"
            element={isAuthenticated && hasPermission(permissions, 'veiculos', 'view') ? <Veiculos /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/notafiscal"
            element={isAuthenticated && hasPermission(permissions, 'notafiscal', 'view') ? <LancaNFe /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/movimentacaoprodutos"
            element={isAuthenticated && hasPermission(permissions, 'movimentacaoprodutos', 'view') ? <MovimentacaoProdutos /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/movimentacaofinanceiradespesas"
            element={isAuthenticated && hasPermission(permissions, 'movimentacaofinanceiradespesas', 'view') ? <MovimentacaoFinanceiraDespesa /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/contasbancarias"
            element={isAuthenticated && hasPermission(permissions, 'contasbancarias', 'view') ? <ContasBancarias /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/contasliquidadas"
            element={isAuthenticated && hasPermission(permissions, 'contasliquidadas', 'view') ? <ContasPagas /> : null} // Condicionalmente não renderiza
          />
          <Route
            path="/contaspendentes"
            element={isAuthenticated && hasPermission(permissions, 'contaspendentes', 'view') ? <ContasPendentes /> : null} // Condicionalmente não renderiza
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
