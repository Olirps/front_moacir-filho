
function converterData (dataString) {
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

module.exports = {converterData,formatarDataResumida};