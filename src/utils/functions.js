
function converterData(dataString) {
  const partes = dataString.split(/[\/ :]/); // Divide a string em dia, mês, ano, hora, minuto e segundo
  const dia = partes[0];
  const mes = partes[1];
  const ano = partes[2];
  const hora = partes[3];
  const minuto = partes[4];
  const segundo = partes[5];

  return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`; // Usa template literals para formatar
}

function formatarDataResumida(dataString) {
  const data = new Date(dataString);
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // Janeiro é 0
  const ano = data.getUTCFullYear();

  return `${dia}/${mes}/${ano}`;
}

function formatPlaca(placa) {
  // Remove todos os caracteres não numéricos ou letras
  const placaLimpa = placa.replace(/[^A-Za-z0-9]/g, '');
  // Adiciona a máscara de placa '000-0000' (com 7 caracteres no total)
  if (placaLimpa.length <= 3) {
    return placaLimpa.toUpperCase();
  } else if (placaLimpa.length <= 6) {
    return placaLimpa.substring(0, 3) + '-' + placaLimpa.substring(3, 6).toUpperCase();
  } else {
    return placaLimpa.substring(0, 3) + '-' + placaLimpa.substring(3, 7).toUpperCase();
  }
};

function decodeJWT(token) {
  // Se o token não for válido ou não tiver 3 partes, retorna null
  if (!token || token.split('.').length !== 3) {
    return null;
  }

  const base64Url = token.split('.')[1]; // Obtém a parte "payload" do token
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Ajusta a codificação para base64 padrão

  // Decodifica a string base64 para JSON
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  // Retorna o payload como um objeto JavaScript
  return JSON.parse(jsonPayload);
};


module.exports = { converterData, formatarDataResumida, formatPlaca,decodeJWT };