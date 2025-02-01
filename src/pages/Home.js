// src/pages/Home.js

import React from 'react';
import '../styles/Home.css'; // Ajuste o caminho conforme necessário

function Home() {
  return (
    <div className="homeCenter" id="home-container">
      <h1 className="header-title">Bem-vindo à página inicial</h1>
      <div className="watermark"></div>
      {/* Adicione o conteúdo específico da página inicial aqui */}
    </div>
  );
}

export default Home;
