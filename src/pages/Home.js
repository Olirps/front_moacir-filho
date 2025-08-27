import React, { useState, useEffect } from "react";
import ContasPagarSemana from "../components/ContasPagarSemana";
import "../styles/Home.css";
import { getContaPagarSemana } from "../services/api";

function Home() {
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContasPagar = async () => {
      try {
        const data = await getContaPagarSemana();
        setContas(data.data);
      } catch (error) {
        console.error("Erro ao buscar contas a pagar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContasPagar();
  }, []);

  return (
    <div>

      <div className="homeCenter" id="home-container">
        <div className="watermark">
        </div>
      </div>
      <div>
        {/* Quadro de Contas a Pagar */}
        <div className="contas-pagar-wrapper">
          <h2 className="quadro-titulo">Contas à Pagar (Semana)</h2>

          {loading ? (
            <div className="spinner-container"><div className="spinner"></div></div>
          ) : contas.length > 0 ? (
            <ContasPagarSemana contas={contas} />
          ) : (
            <p className="sem-contas">Nenhuma conta a pagar nesta semana.</p>
          )}
        </div>
      </div>
    </div>

  );
}

export default Home;
