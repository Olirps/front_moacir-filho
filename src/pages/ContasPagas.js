import React, { useState, useEffect } from 'react';
import { getContasPagas } from '../services/api';
import { formatarData, formatarMoedaBRL } from '../utils/functions';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ContasPagas() {
    const [contasPagas, setContasPagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [contasFiltradas, setContasFiltradas] = useState([]);

    // Busca as contas pagas ao carregar o componente
    useEffect(() => {
        async function fetchContasPagas() {
            try {
                const data = await getContasPagas();
                setContasPagas(data.data);
                setContasFiltradas(data.data); // Inicialmente, exibe todas as contas
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchContasPagas();
    }, []);

    // Função para aplicar o filtro de data
    const aplicarFiltro = () => {
        const contasFiltradas = contasPagas.filter((conta) => {
            const dataPagamento = new Date(conta.data_pagamento); // Usando a propriedade `data_pagamento` do JSON
            const inicio = dataInicio ? new Date(dataInicio) : null;
            const fim = dataFim ? new Date(dataFim) : null;

            // Verifica se a data de pagamento está dentro do intervalo
            return (
                (!inicio || dataPagamento >= inicio) &&
                (!fim || dataPagamento <= fim)
            );
        });

        setContasFiltradas(contasFiltradas);
    };

    // Função para limpar os filtros
    const limparFiltros = () => {
        setDataInicio('');
        setDataFim('');
        setContasFiltradas(contasPagas); // Exibe todas as contas novamente
    };

    // Função para gerar PDF
    const gerarPDF = () => {
        const doc = new jsPDF();
        const columns = [
            { title: "Descrição", dataKey: "descricao" },
            { title: "Valor Pago", dataKey: "valor_pago" },
            { title: "Data de Pagamento", dataKey: "data_pagamento" },
            { title: "Status", dataKey: "status" }
        ];

        // Agrupa os lançamentos por método de pagamento
        const grupos = contasFiltradas.reduce((acc, conta) => {
            const metodo = conta.metodo_pagamento;
            if (!acc[metodo]) {
                acc[metodo] = [];
            }
            acc[metodo].push(conta);
            return acc;
        }, {});

        let valorGeralTotal = 0; // Valor total geral de todos os grupos
        let startY = 20; // Posição inicial Y para a primeira tabela

        // Itera sobre os grupos e adiciona tabelas ao PDF
        Object.keys(grupos).forEach((metodo, index) => {
            const contasDoGrupo = grupos[metodo];
            const rows = contasDoGrupo.map((conta) => ({
                descricao: conta.descricao,
                valor_pago: formatarMoedaBRL(conta.valor_pago),
                data_pagamento: formatarData(conta.data_pagamento),
                status: conta.status
            }));

            // Calcula o valor total do grupo
            const valorTotalGrupo = contasDoGrupo.reduce((total, conta) => total + conta.valor_pago, 0);
            valorGeralTotal += valorTotalGrupo; // Soma ao valor geral

            // Adiciona o título do grupo (método de pagamento)
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Método de Pagamento: ${metodo}`, 14, startY);

            // Adiciona a tabela do grupo
            doc.autoTable({
                startY: startY + 10, // Ajusta a posição Y para começar abaixo do título
                head: [columns.map(col => col.title)],
                body: rows.map(row => columns.map(col => row[col.dataKey])),
                didDrawPage: (data) => {
                    // Adiciona o valor total do grupo ao final da tabela
                    if (data.pageNumber === data.pageCount) {
                        doc.setFontSize(12);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`Total (${metodo}): ${formatarMoedaBRL(valorTotalGrupo)}`, 14, data.cursor.y + 10);
                    }
                }
            });

            // Atualiza a posição Y para o próximo grupo
            startY = doc.lastAutoTable.finalY + 20;

            // Adiciona uma nova página se o próximo grupo não couber na página atual
            if (startY > 280 && index < Object.keys(grupos).length - 1) {
                doc.addPage();
                startY = 20; // Reinicia a posição Y para a nova página
            }
        });

        // Adiciona o valor geral total no final do PDF
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Valor Geral Total: ${formatarMoedaBRL(valorGeralTotal.toFixed(2))}`, 14, doc.lastAutoTable.finalY + 20);

        // Salva o PDF
        doc.save("contas_pagas.pdf");
    };

    if (loading) {
        return <div>Carregando...</div>;
    }

    if (error) {
        return <div>Erro: {error}</div>;
    }

    return (
        <div>
            <h1 className="title-page">Contas Pagas</h1>

            {/* Filtros de data */}
            <div id="search-container">
                <div id="search-fields">
                    <label>
                        Data de Início:
                        <input
                            className='input-geral'
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                        />
                    </label>
                    <label>
                        Data de Fim:
                        <input
                            className='input-geral'
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                        />
                    </label>
                </div>

                <div id='button-group'>
                    <button className="button" onClick={aplicarFiltro}>Filtrar</button>
                    <button className="button" onClick={limparFiltros}>Limpar</button>
                    <button className="button" onClick={gerarPDF}>Imprimir</button>
                </div>
            </div>
            <div id="separator-bar"></div>

            {/* Tabela de contas pagas */}
            <div id="results-container">
                <div id="grid-padrao-container">
                    <table id="grid-padrao">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Valor Pago</th>
                                <th>Data de Pagamento</th>
                                <th>Método de Pagamento</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contasFiltradas.map((conta) => (
                                <tr key={conta.id}>
                                    <td>{conta.descricao}</td>
                                    <td>{formatarMoedaBRL(conta.valor_pago)}</td>
                                    <td>{formatarData(conta.data_pagamento)}</td>
                                    <td>{conta.metodo_pagamento}</td>
                                    <td>{conta.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ContasPagas;