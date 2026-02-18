import React, { useState, useEffect } from 'react';
import { formatarData, formatarMoedaBRL, converterMoedaParaNumero } from '../utils/functions';
import { getParcelaByID, pagamentoParcela } from '../services/api';
import ModalPagarLancamentos from '../components/ModalPagarLancamentos';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/hasPermission';
import '../styles/ContasPagarSemana.css';
const LIMITE_INICIAL = 5;


const ContasPagarSemana = ({ contas, loading }) => {
  const [selectedParcela, setSelectedParcela] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const { permissions } = useAuth();
  const [expandido, setExpandido] = useState(false);


  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const contasVisiveis = expandido
    ? contas
    : contas.slice(0, LIMITE_INICIAL);

  const handlePagar = async (conta) => {
    if (!hasPermission(permissions, 'pagamentosparcelas', 'insert')) {
      setToast({ message: 'Você não tem permissão para pagar.', type: 'error' });
      return;
    }

    const response = await getParcelaByID(conta.id);
    setSelectedParcela(response.data);
    setIsModalOpen(true);
  };


  const handleSavePagamento = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const pagamento = {
      data_pagamento: formData.get('datapagamento'),
      valor_pago: converterMoedaParaNumero(formData.get('valorPago')),
      conta_id: formData.get('contabancaria'),
      metodo_pagamento: formData.get('formaPagamento'),
      data_efetiva_pg: new Date().toISOString().split('T')[0],
      status: 'liquidado'
    };

    try {
      await pagamentoParcela(selectedParcela.id, pagamento);
      setToast({ message: 'Conta paga com sucesso!', type: 'success' });
      setIsModalOpen(false);
    } catch {
      setToast({ message: 'Erro ao realizar pagamento.', type: 'error' });
    }
  };

  if (!contas.length) {
    return (
      <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
        <p className="text-green-700">
          🎉 Nenhuma conta a pagar nesta semana!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="contas-container">
        <div className="contas-grid">
          {contasVisiveis.map(conta => (
            <ContaSemanaCard
              key={conta.id}
              conta={conta}
              onPagar={() => handlePagar(conta)}
            />
          ))}
        </div>
        {contas.length > LIMITE_INICIAL && (
          <button
            className="btn-expandir"
            onClick={() => setExpandido(!expandido)}
          >
            {expandido ? 'Mostrar menos' : 'Ver mais contas'}
          </button>
        )}
      </div>

      {toast.message && <Toast type={toast.type} message={toast.message} />}

      {isModalOpen && (
        <ModalPagarLancamentos
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSavePagamento}
          parcela={selectedParcela}
        />
      )}
    </>
  );
};

const ContaSemanaCard = ({ conta, onPagar }) => {
  const statusClass =
    conta.status === 'atrasado'
      ? 'status-atrasado'
      : conta.status === 'vence_hoje'
        ? 'status-hoje'
        : 'status-normal';

  return (
    <div className={`conta-card ${statusClass}`}>
      <div className="conta-card-header">
        <div>
          <h3>{conta.descricao}</h3>
          <span>
            Vence em {formatarData(conta.vencimento)}
          </span>
        </div>

        <strong>{formatarMoedaBRL(conta.valor_parcela)}</strong>
      </div>

      <button className="btn-pagar" onClick={onPagar}>
        Pagar agora
      </button>
    </div>
  );
};


export default ContasPagarSemana;
