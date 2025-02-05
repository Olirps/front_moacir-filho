import React, { useState, useEffect } from 'react';
import { getAllMovimentacaofinanceiraDespesa, addMovimentacaofinanceiraDespesa, getLancamentoDespesaById,updateMovimentacaofinanceiraDespesa, addParcelasDespesa, getParcelasDespesa } from '../services/api';
import '../styles/MovimentacaoFinanceiraDespesa.css';
import ModalMovimentacaoFinanceiraDespesa from '../components/ModalMovimentacaoFinanceiraDespesa';
import ModalLancamentoParcelas from '../components/ModalLancamentoParcelas'; // Importe o novo modal
import Toast from '../components/Toast';

function MovimentacaoFinanceiraDespesa() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [funcionario, setFuncionario] = useState('');
  const [filteredMovimentacoes, setFilteredMovimentacoes] = useState([]);
  const [valor, setValor] = useState('');
  const [notaId, setNotaId] = useState('');
  const [dataLancamento, setDataLancamento] = useState('');
  const [tipo, setTipo] = useState('');
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLancaParcelasOpen, setIsModalLancaParcelasOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [selectedMovimentacao, setSelectedMovimentacao] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // responsavel por expandir
  const [expandedRows, setExpandedRows] = useState({});
  const [parcelas, setParcelas] = useState({});

  //
  useEffect(() => {
    const fetchMovimentacao = async () => {
      try {
        const response = await getAllMovimentacaofinanceiraDespesa();
        setMovimentacoes(response.data);
        setFilteredMovimentacoes(response.data);
      } catch (err) {
        console.error('Erro ao buscar movimentações financeiras', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimentacao();
  }, []);

  const handleSearch = () => {
    const results = movimentacoes.filter(movimentacao =>
      (descricao ? movimentacao.descricao.toLowerCase().includes(descricao.toLowerCase()) : true) &&
      (fornecedor ? movimentacao.fornecedor_id === fornecedor : true) &&
      (funcionario ? movimentacao.funcionario_id === funcionario : true)
    );

    setFilteredMovimentacoes(results);
    setCurrentPage(1);
  };

  const handleClear = () => {
    setDescricao('');
    setFornecedor('');
    setFuncionario('');
    setFilteredMovimentacoes(movimentacoes);
    setCurrentPage(1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSuccess = () => {
    console.log("Despesa salva com sucesso!");
    // Adicione outras ações que deseja realizar após salvar
  };


  const handleAddMovimentacao = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newMovimentacao = {
      descricao: formData.get('descricao'),
      valor: formData.get('valor'),
      fornecedor_id: formData.get('fornecedor'),
      funcionario_id: formData.get('funcionario'),
      nota_id: formData.get('notaId'),
      data_lancamento: formData.get('dataLancamento'),
      tipo: formData.get('tipo')
    };

    try {
      await addMovimentacaofinanceiraDespesa(newMovimentacao);
      setToast({ message: "Movimentação financeira cadastrada com sucesso!", type: "success" });
      setIsModalOpen(false);
      const response = await getAllMovimentacaofinanceiraDespesa();
      setMovimentacoes(response.data);
      setFilteredMovimentacoes(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Erro ao cadastrar movimentação financeira.";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  const handleEditClick = async (movimentacao) => {
    const response = await getLancamentoDespesaById(movimentacao.id);
    setSelectedMovimentacao(response.data);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleLancaParcelas = async (movimentacao) => {
    setSelectedMovimentacao(movimentacao);
    setIsModalLancaParcelasOpen(true);
  };

  const handleSaveParcelas = async (parcelas) => {
    const lancaparcelas = await addParcelasDespesa(parcelas);
    // Aqui você pode enviar as parcelas para o backend ou processá-las conforme necessário
    console.log("Parcelas salvas:", parcelas);
    setToast({ message: "Parcelas salvas com sucesso!", type: "success" });
    setIsModalLancaParcelasOpen(false);
  };


  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updatedMovimentacao = {
      descricao: formData.get('descricao'),
      valor: formData.get('valor'),
      fornecedor_id: formData.get('fornecedor'),
      funcionario_id: formData.get('funcionario'),
      nota_id: formData.get('notaId'),
      data_lancamento: formData.get('dataLancamento'),
      tipo: formData.get('tipo')
    };

    try {
      await updateMovimentacaofinanceiraDespesa(selectedMovimentacao.id, updatedMovimentacao);
      setToast({ message: "Movimentação financeira atualizada com sucesso!", type: "success" });
      setIsModalOpen(false);
      setSelectedMovimentacao(null);
      setIsEdit(false);
      const response = await getAllMovimentacaofinanceiraDespesa();
      setMovimentacoes(response.data);
      setFilteredMovimentacoes(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "Erro ao atualizar movimentação financeira.";
      setToast({ message: errorMessage, type: "error" });
    }
  };

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const totalPages = Math.ceil(filteredMovimentacoes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentMovimentacoes = filteredMovimentacoes.slice(startIndex, startIndex + rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  //responsavel por expandir a linha
  const toggleExpand = async (movimentacaoId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [movimentacaoId]: !prev[movimentacaoId],
    }));

    if (!parcelas[movimentacaoId]) {
      try {
        const response = await getParcelasDespesa(movimentacaoId);
        setParcelas((prev) => ({ ...prev, [movimentacaoId]: response.data }));
      } catch (err) {
        console.error('Erro ao buscar parcelas', err);
      }
    }
  };
  //responsavel por expandir a linha - final

  const formatarData = (data) => {
    const dataCorrigida = new Date(data);
    dataCorrigida.setMinutes(dataCorrigida.getMinutes() + dataCorrigida.getTimezoneOffset()); // Ajuste de fuso horário
    return dataCorrigida.toLocaleDateString('pt-BR');
  };

  return (
    <div id="movimentacoes-container">
      <h1 className="title-page">Consulta de Movimentações Financeiras</h1>
      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>) : (
        <>
          <div id="search-container">
            <div id="search-fields">
              <div>
                <label htmlFor="descricao">Descrição</label>
                <input className="input-geral"
                  type="text"
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength="150"
                />
              </div>
              <div>
                <label htmlFor="fornecedor">Fornecedor</label>
                <input className="input-geral"
                  type="text"
                  id="fornecedor"
                  value={fornecedor}
                  onChange={(e) => setFornecedor(e.target.value)}
                  maxLength="150"
                />
              </div>
              <div>
                <label htmlFor="funcionario">Funcionário</label>
                <input className="input-geral"
                  type="text"
                  id="funcionario"
                  value={funcionario}
                  onChange={(e) => setFuncionario(e.target.value)}
                  maxLength="150"
                />
              </div>
            </div>
            <div>
              <div id="button-group">
                <button onClick={handleSearch} className="button">Pesquisar</button>
                <button onClick={handleClear} className="button">Limpar</button>
                <button onClick={() => {
                  setIsModalOpen(true);
                  setIsEdit(false);
                  setSelectedMovimentacao(null);
                }} className="button">Cadastrar</button>
              </div>
            </div>
          </div>

          <div id="separator-bar"></div>

          <div id="results-container">
            <div id="grid-padrao-container">
              <table id='grid-padrao'>
                <thead>
                  <tr>
                    <th></th>
                    <th>ID</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Data Lançamento</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((movimentacao) => (
                    <React.Fragment key={movimentacao.id}>
                      <tr>
                        <td>
                          <button onClick={() => toggleExpand(movimentacao.id)}>
                            {expandedRows[movimentacao.id] ? '▼' : '▶'}
                          </button>
                        </td>
                        <td>{movimentacao.id}</td>
                        <td>{movimentacao.descricao}</td>
                        <td>{
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(movimentacao.valor || 0)
                        }</td>
                        <td>{formatarData(movimentacao.data_lancamento)}</td>
                        <td>
                          <div>
                            {movimentacao.status === 'aberta' ? (
                              <>
                                <button
                                  onClick={() => handleEditClick(movimentacao)}
                                  className="edit-button"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleLancaParcelas(movimentacao)}
                                  className="edit-button"
                                >
                                  Lançar Parcelas
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleLancaParcelas(movimentacao)}
                                className="edit-button"
                              >
                                Visualizar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {expandedRows[movimentacao.id] && parcelas[movimentacao.id] && (
                        parcelas[movimentacao.id].map((parcela) => (
                          <tr key={parcela.id} className="parcela-row">
                            <td></td>
                            <td colspan="2">Parcela {parcela.numero} - {parcela.descricao}</td>
                            <td>{new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(parcela.valor_parcela || 0)}</td>
                            <td>{formatarData(parcela.vencimento)}</td>
                            <td>
                              <button
                                className="edit-button">
                                Pagar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div id="pagination-container">
              <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                Próxima
              </button>
            </div>

            <div id="show-more-container">
              <label htmlFor="rows-select">Mostrar</label>
              <select id="rows-select" value={rowsPerPage} onChange={handleRowsChange}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <label htmlFor="rows-select">por página</label>
            </div>
          </div>
        </>
      )}

      {toast.message && <Toast type={toast.type} message={toast.message} />}
      {isModalOpen && (
        <ModalMovimentacaoFinanceiraDespesa
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={isEdit ? handleEditSubmit : handleAddMovimentacao}
          onSuccess={handleSuccess}  // Passando a função handleSuccess
          movimentacao={selectedMovimentacao}
          edit={isEdit}
        />
      )}
      {isModalLancaParcelasOpen && (
        <ModalLancamentoParcelas
          isOpen={isModalLancaParcelasOpen}
          onClose={() => setIsModalLancaParcelasOpen(false)}
          valorTotal={valor}
          despesa={selectedMovimentacao}
          onSave={handleSaveParcelas}

        />
      )}
    </div>
  );
}

export default MovimentacaoFinanceiraDespesa;
