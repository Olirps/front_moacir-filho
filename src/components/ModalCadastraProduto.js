import React, { useEffect, useState } from 'react';
import '../styles/ModalCadastraProduto.css';
import Toast from '../components/Toast';
import { addProdutos, updateNFe } from '../services/api';


const ModalCadastraProduto = ({ isOpen, onClose, onSubmit, produto, prod, additionalFields = [] }) => {
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
  const [valor_unit, setUnit] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [formData, setFormData] = React.useState({});




  useEffect(() => {
    if (produto) {
      setxProd(produto.xProd || '');
      setcEAN(produto.cEAN || '');
      setqtdMinima(produto.qtdMinima || '');
      setqCom(produto.qCom || '');
    }
  }, [produto]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita o comportamento padrão de recarregar a página

    if (prod?.nNF) {
      const nota_id = 0
      const formData = new FormData(e.target);
      const newProduto = {
        tipoProduto:tipoProduto,
        xProd: formData.get('xProd'),
        cEAN: formData.get('cEAN'),
        qtdMinima: formData.get('qtdMinima'),
        qCom: formData.get('qCom'),
        vUnCom: formData.get('valor_unit'),           //valor_unit: formData.get('valor_unit'),  ajustado para tratar produtos cadastrados manual na nf 24/09/2024
        nota_id: prod?.id
      };

      // Adiciona os campos adicionais
      additionalFields.forEach((field) => {
        newProduto[field.name] = formData.get(field.name);
      });

      handleaddProdutos(newProduto); // Chama a função handleaddProdutos se prod.nNF não for nulo
    } else {
      const dados = {
        tipo: tipoProduto,
        xProd,
        ...(tipoProduto === 'produto' && { cEAN, qtdMinima, qCom }),
      };
      onSubmit({
        tipoProduto,
        xProd,
        cEAN,
        qtdMinima,
        qCom,
        valor_unit
      });// Continua com o comportamento original se prod.nNF for nulo
    }
  };

  const handleaddProdutos = async (new_produto) => {
    try {
      const response = await addProdutos(new_produto);
      await updateNFe(prod.id, { status: 'andamento' });

      setProdutos(response.data);
      setToast({ message: "Produto cadastrado com sucesso!", type: "success" });
      onClose(); // Usando o onClose passado como prop para fechar o modal
      onSubmit();
    } catch (err) {

      const errorMessage = err.response.data.erro;
      setToast({ message: errorMessage, type: "error" });

    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>
          {produto ? 'Editar ' : 'Cadastro de'} {tipoProduto === 'produto' ? 'Produto' : 'Serviços'}{' '}
          {prod?.nNF ? ` - Nota Fiscal Nº ${prod.nNF}` : ''}
        </h2>

        <form onSubmit={handleSubmit}>
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

          <div id="cadastro-padrao">
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
            {prod && additionalFields.map((field, index) => (
              <input
                className='input-geral'
                key={index}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                onChange={handleInputChange}
              />
            ))}
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
