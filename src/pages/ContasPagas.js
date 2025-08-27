import React, { useState, useEffect } from 'react';
import { getContasPagas } from '../services/api';
import { formatarData, formatarMoedaBRL, somarValoresMonetarios } from '../utils/functions';
import { cpfCnpjMask, removeMaks } from '../components/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ContasPagas() {
    const [contasPagas, setContasPagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [descricao, setDescricao] = useState('');
    const [credorNome, setCredorNome] = useState('');
    const [credorCpfCnpj, setCredorCpfCnpj] = useState('');
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

    // Função para aplicar o filtro de data e outros critérios
    const aplicarFiltro = () => {
        const contasFiltradas = contasPagas.filter((conta) => {
            const dataPagamento = new Date(conta.data_pagamento);
            const inicio = dataInicio ? new Date(dataInicio) : null;
            const fim = dataFim ? new Date(dataFim) : null;

            // Converte os filtros de texto para minúsculas para comparação sem distinção entre maiúsculas e minúsculas
            const filtroCredorCpfCnpj = credorCpfCnpj ? credorCpfCnpj.toLowerCase() : "";
            const filtroCredorNome = credorNome ? credorNome.toLowerCase() : "";
            const filtroDescricao = descricao ? descricao.toLowerCase() : "";

            // Verifica se os valores do objeto também estão em minúsculas para comparação
            const credorCpfCnpjConta = conta.credor_cpfcnpj ? conta.credor_cpfcnpj.toLowerCase() : "";
            const credorNomeConta = conta.credor_nome ? conta.credor_nome.toLowerCase() : "";
            const descricaoConta = conta.descricao ? conta.descricao.toLowerCase() : "";

            // Verifica se a data de pagamento está dentro do intervalo
            const dataValida = (!inicio || dataPagamento >= inicio) && (!fim || dataPagamento <= fim);

            // Verifica se os valores digitados pelo usuário estão contidos nos campos correspondentes
            const credorCpfCnpjValido = !filtroCredorCpfCnpj || credorCpfCnpjConta.includes(filtroCredorCpfCnpj);
            const credorNomeValido = !filtroCredorNome || credorNomeConta.includes(filtroCredorNome);
            const descricaoValida = !filtroDescricao || descricaoConta.includes(filtroDescricao);

            return dataValida && credorCpfCnpjValido && credorNomeValido && descricaoValida;
        });

        setContasFiltradas(contasFiltradas);
    };


    // Função para limpar os filtros
    const limparFiltros = () => {
        setDataInicio('');
        setDataFim('');
        setDescricao('');
        setCredorNome('');
        setCredorCpfCnpj('');
        setContasFiltradas(contasPagas); // Exibe todas as contas novamente
    };

    // Função para gerar PDF
    const gerarPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const columns = [
            { title: "Descrição", dataKey: "descricao" },
            { title: "Boleto", dataKey: "boleto" }, // 🔹 nova coluna
            { title: "Valor Pago", dataKey: "valor_pago" },
            { title: "Data de Pagamento", dataKey: "data_pagamento" },
            { title: "Origem", dataKey: "status" }
        ];

        // Cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Fazenda Aparecida do Norte", 14, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Rodovia MT 129 - KM 10 - Paranatinga - MT", 14, 30);
        doc.text("Tel: (67) 98124-7654", 14, 36);
        doc.text("Email: faz.aparecidadonorte@gmail.com", 14, 42);

        doc.setFontSize(12);
        doc.text(`Período: ${dataInicio ? formatarData(dataInicio) : 'Início'} a ${dataFim ? formatarData(dataFim) : 'Fim'}`, 14, 52);

        // Agrupa os lançamentos
        const grupos = contasFiltradas.reduce((acc, conta) => {
            const metodo = conta.metodo_pagamento;
            if (!acc[metodo]) acc[metodo] = [];
            acc[metodo].push(conta);
            return acc;
        }, {});

        let valorGeralTotal = 0;
        let startY = 60;

        Object.keys(grupos).forEach((metodo, index) => {
            const contasDoGrupo = grupos[metodo];

            // No seu código:
            const rows = contasDoGrupo.map((conta) => {
                return {
                    descricao: conta.credor_nome + ' - ' + conta.descricao,
                    boleto: conta.boleto || "-",
                    valor_pago: formatarMoedaBRL(conta.valor_pago),
                    data_pagamento: formatarData(conta.data_pagamento),
                    status: conta.conta_bancaria_nome
                };
            });

            // Calcula o total fora do map para melhor performance
            const valores = contasDoGrupo.map(conta => conta.valor_pago);
            const valorTotalGrupo = somarValoresMonetarios(valores);

            valorGeralTotal += valorTotalGrupo;

            // 🔹 adiciona linha final com total do grupo
            rows.push({
                descricao: "",
                boleto: "",
                valor_pago: `Total (${metodo}): ${formatarMoedaBRL(valorTotalGrupo)}`,
                data_pagamento: "",
                status: ""
            });

            // Título do grupo
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Método de Pagamento: ${metodo}`, 14, startY);

            // Tabela
            doc.autoTable({
                startY: startY + 8,
                head: [columns.map(col => col.title)],
                body: rows.map(row => columns.map(col => row[col.dataKey])),
            });

            startY = doc.lastAutoTable.finalY + 15;

            // Quebra de página se necessário
            if (startY > 190 && index < Object.keys(grupos).length - 1) {
                doc.addPage('landscape');
                startY = 20;
            }
        });

        // 🔹 total geral no final
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`Valor Geral Total: ${formatarMoedaBRL(valorGeralTotal)}`, 14, doc.lastAutoTable.finalY + 20);

        doc.save("contas_pagas.pdf");
    };


    if (loading) {
        return <div className="spinner-container"><div className="spinner"></div></div>;
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
                    <label htmlFor="descricao">Descrição</label>
                    <input className="input-geral"
                        type="text"
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        maxLength="150"
                    />
                    <label htmlFor="credorNome">Nome Credor</label>
                    <input className="input-geral"
                        type="text"
                        id="credorNome"
                        value={credorNome}
                        onChange={(e) => setCredorNome(e.target.value)}
                        maxLength="150"
                    />

                    <div>
                        <label htmlFor="credorCpfCnpj">CPF/CNPJ</label>
                        <input className="input-geral"
                            type="text"
                            id="credorCpfCnpj"
                            value={cpfCnpjMask(credorCpfCnpj)}
                            onChange={(e) => setCredorCpfCnpj(removeMaks(e.target.value))}
                            maxLength="18"
                        />
                    </div>
                    <div>
                        <label>
                            Data de Início:
                            <input
                                className='input-geral'
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDataInicio(e.target.value)}
                            />
                        </label>
                    </div>
                    <div>
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
                                <th>Credor</th>
                                <th>Descrição</th>
                                <th>Valor Pago</th>
                                <th>Data de Pagamento</th>
                                <th>Método de Pagamento</th>
                                <th>Origem</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contasFiltradas.map((conta) => (
                                <tr key={conta.id}>
                                    <td>{conta.credor_nome}</td>
                                    <td>{conta.descricao}</td>
                                    <td>{formatarMoedaBRL(conta.valor_pago)}</td>
                                    <td>{formatarData(conta.data_pagamento)}</td>
                                    <td>{conta.metodo_pagamento}</td>
                                    <td>{conta.conta_bancaria_nome}</td>
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