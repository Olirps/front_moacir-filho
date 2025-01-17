import React, { useEffect, useState } from 'react';
import '../styles/ModalCadastraProduto.css';
import Toast from '../components/Toast';

const ModalCadastraProduto = ({ isOpen, onClose, onSubmit, produto, prod }) => {
  const [tipoProduto, setTipoProduto] = useState(
    produto?.tipo_produto === 'produto' || produto?.tipo_produto === 'servico'
      ? produto.tipo_produto
      : 'produto' // Define 'produto' como padrão caso o valor seja inválido
  );
  const [xProd, setxProd] = useState('');
  const [cEAN, setcEAN] = useState('');
  const [qtdMinima, setqtdMinima] = useState('');
  const [qCom, setqCom] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    if (produto) {
      setxProd(produto.xProd || '');
      setcEAN(produto.cEAN || '');
      setqtdMinima(produto.qtdMinima || '');
      setqCom(produto.qCom || '');
    }
  }, [produto]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      tipo: tipoProduto,
      xProd,
      ...(tipoProduto === 'produto' && { cEAN, qtdMinima, qCom }), // Só envia esses campos se for produto
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-cad-prod">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{produto ? 'Editar Cadastro de' : 'Cadastro de'} {tipoProduto === 'produto' ? 'Produtos' : 'Serviços'} {prod?.nNF ? ` - Nota Fiscal Nº ${prod.nNF}` : ''}</h2>

        <form onSubmit={handleSubmit}>
          {/* Radio Button para escolher Produto ou Serviço */}
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="tipo"
                value="produto"
                checked={tipoProduto === 'produto'}
                onChange={() => setTipoProduto('produto')}
              />
              Produto
            </label>
            <label>
              <input
                type="radio"
                name="tipo"
                value="servico"
                checked={tipoProduto === 'servico'}
                onChange={() => setTipoProduto('servico')}
              />
              Serviço
            </label>
          </div>

          <div id="cadastro-produto">
            <div>
              <label htmlFor="xProd">Nome</label>
              <input
                className="input-geral"
                type="text"
                id="xProd"
                name="xProd"
                value={xProd}
                onChange={(e) => setxProd(e.target.value)}
                maxLength="150"
                required
              />
            </div>

            {/* Apenas exibe os campos abaixo se for um Produto */}
            {tipoProduto === 'produto' && (
              <>
                <div>
                  <label htmlFor="cEAN">Código de Barras</label>
                  <input
                    className="input-geral"
                    type="text"
                    id="cEAN"
                    name="cEAN"
                    value={cEAN}
                    onChange={(e) => setcEAN(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qtdMinima">Quantidade Mínima</label>
                  <input
                    className="input-geral"
                    type="number"
                    id="qtdMinima"
                    name="qtdMinima"
                    value={qtdMinima}
                    onChange={(e) => setqtdMinima(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="qCom">Quantidade</label>
                  <input
                    className="input-geral"
                    type="text"
                    id="qCom"
                    name="qCom"
                    value={qCom}
                    onChange={(e) => setqCom(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <div id="botao-salva">
            <button type="submit" id="btnsalvar" className="button">Salvar</button>
          </div>
        </form>
      </div>
      {toast.message && <Toast type={toast.type} message={toast.message} onClose={() => setToast({ message: '', type: '' })} />}
    </div>
  );
};

export default ModalCadastraProduto;
