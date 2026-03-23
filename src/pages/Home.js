import React, { useState, useEffect } from "react";
import ContasPagarSemana from "../components/ContasPagarSemana";
import "../styles/Home.css";
import { getContaPagarSemana } from "../services/api";

function Home() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarContasSemana = async () => {
    const res = await getContaPagarSemana();
    setContas(res.data);
  };

  useEffect(() => {
    carregarContasSemana()
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        Contas a pagar esta semana
      </h1>

      <ContasPagarSemana
        contas={contas}
        loading={loading}
        onPagamentoSucesso={carregarContasSemana}
      />
    </div>
  );
}

export default Home;
