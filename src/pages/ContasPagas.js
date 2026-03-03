import React, { useState, useEffect } from 'react';
import { getContasPagas, updateDataPagamento } from '../services/api';
import { formatarData, formatarMoedaBRL, somarValoresMonetarios } from '../utils/functions';
import { cpfCnpjMask, removeMaks } from '../components/utils';
import LogoMoacir from '../img/LogoMoacir.png';
import ModalEditarDataPagamento from '../components/ModalEditarDataPagamento';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/hasPermission';

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
    const [isModalEditarDataOpen, setIsModalEditarDataOpen] = useState(false);
    const [contaSelecionada, setContaSelecionada] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });
    const { permissions } = useAuth();

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

    useEffect(() => {
        if (toast.message) {
            const timer = setTimeout(() => setToast({ message: '', type: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleEditarData = (conta) => {
        if (!hasPermission(permissions, 'pagamentosparcelas', 'edit')) {
            setToast({ message: "Você não tem permissão para editar a data de pagamento.", type: "error" });
            return;
        }
        setContaSelecionada(conta);
        setIsModalEditarDataOpen(true);
    };

    const handleSalvarNovaData = async (novaData) => {
        try {
            await updateDataPagamento(contaSelecionada.id, novaData);
            setToast({ message: "Data de pagamento atualizada com sucesso!", type: "success" });
            setIsModalEditarDataOpen(false);
            setContaSelecionada(null);
            
            // Recarrega as contas pagas
            const data = await getContasPagas();
            setContasPagas(data.data);
            aplicarFiltro();
        } catch (err) {
            const errorMessage = err.response?.data?.error || "Erro ao atualizar data de pagamento.";
            setToast({ message: errorMessage, type: "error" });
        }
    };

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


    /**
     * Gera recibo compacto confirmando que o EMITENTE pagou o CREDOR.
     * @param {object} conta - objeto da conta (ex: { id, credor_nome, credor_cpf_cnpj, descricao, valor_pago, data_pagamento, metodo_pagamento, conta_bancaria_nome })
     * @param {object} options - { emitenteNome, emitenteCnpj, emitenteEndereco, logoBase64, format: [widthMM, heightMM] }
     */
    const emitirRecibo = (conta, options = {}) => {
        const {
            emitenteNome = "Fazenda Aparecida do Norte",
            emitenteCnpj = "",
            format = [180, 100] // largura 180mm x altura 100mm (recibo horizontal)
        } = options;

        const doc = new jsPDF({
            orientation: "landscape", // horizontal
            unit: "mm",
            format
        });

        // Helpers (uso seguro de campos que podem ter nomes diferentes)
        const cpfCnpjValue = conta.credor_cpf_cnpj || conta.credor_cpfcnpj || conta.credorCpfCnpj || "-";
        const valor = Number(String(conta.valor_pago || 0).replace(',', '.')) || 0;
        const valorFormatado = (typeof formatarMoedaBRL === "function")
            ? formatarMoedaBRL(valor)
            : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
        const dataFormatada = (typeof formatarData === "function") ? formatarData(conta.data_pagamento) : String(conta.data_pagamento || '');

        const numeroPorExtenso = (v) => {
            const normalize = (n) => {
                const s = String(n).replace(/\s/g, '').replace(',', '.');
                return Number(s) || 0;
            };
            const n = normalize(v);
            const reais = Math.floor(n);
            const cents = Math.round((n - reais) * 100);

            const unidades = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
            const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
            const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

            const centenasToWords = (num) => {
                num = Number(num);
                if (num === 0) return "";
                if (num === 100) return "cem";
                if (num < 20) return unidades[num];
                if (num < 100) {
                    const d = Math.floor(num / 10);
                    const u = num % 10;
                    return dezenas[d] + (u ? " e " + unidades[u] : "");
                }
                const c = Math.floor(num / 100);
                const rest = num % 100;
                return centenas[c] + (rest ? " e " + centenasToWords(rest) : "");
            };

            const parts = [];
            const millions = Math.floor(reais / 1000000);
            const thousands = Math.floor((reais % 1000000) / 1000);
            const hundreds = reais % 1000;

            if (millions) parts.push((millions === 1 ? "um milhão" : `${centenasToWords(millions)} milhões`));
            if (thousands) parts.push((thousands === 1 ? "mil" : `${centenasToWords(thousands)} mil`));
            if (hundreds) parts.push(centenasToWords(hundreds));

            const reaisStr = parts.length ? parts.join(" e ") + (reais === 1 ? " real" : " reais") : (reais === 0 ? "zero reais" : (reais === 1 ? "um real" : `${reais} reais`));

            const centsStr = cents ? ((() => {
                if (cents < 20) return unidades[cents];
                const d = Math.floor(cents / 10);
                const u = cents % 10;
                return dezenas[d] + (u ? " e " + unidades[u] : "");
            })() + (cents === 1 ? " centavo" : " centavos")) : "";

            return cents ? `${reaisStr} e ${centsStr}` : reaisStr;
        };


        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 6;

        // -----------------------------
        // MARCA D'ÁGUA
        // -----------------------------
        try {
            doc.setGState(new doc.GState({ opacity: 1.5 }));
            const logoW = pageW * 0.6;
            const logoH = pageH * 0.6;
            const x = (pageW - logoW) / 2;
            const y = (pageH - logoH) / 2;
            doc.addImage(LogoMoacir, 'PNG', x, y, logoW, logoH);
            doc.setGState(new doc.GState({ opacity: 5 }));
        } catch (err) {
            console.warn("Erro ao adicionar marca d'água:", err);
        }

        // -----------------------------
        // Cabeçalho e corpo do recibo
        // -----------------------------
        let y = margin;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(emitenteNome, pageW / 2, y + 6, { align: "center" });
        if (emitenteCnpj) {
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.text(`CNPJ: ${emitenteCnpj}`, pageW / 2, y + 11, { align: "center" });
            y += 6;
        }
        y += 12;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("RECIBO", pageW / 2, y, { align: "center" });
        y += 6;

        doc.setLineWidth(0.4);
        doc.line(margin, y, pageW - margin, y);
        y += 6;

        const pagador = emitenteNome;
        const recebedor = conta.credor_nome || "-";
        const corpo = `Declaramos para os devidos fins que ${pagador}, ${emitenteCnpj ? `CNPJ: ${emitenteCnpj}, ` : ""} pagou a ${recebedor}, CPF/CNPJ: ${cpfCnpjMask ? cpfCnpjMask(cpfCnpjValue) : cpfCnpjValue}, a importância de ${valorFormatado} (${numeroPorExtenso(valor)}), referente a ${conta.descricao || "-"}, pago em ${dataFormatada} através de ${conta.metodo_pagamento || "-"} (Origem: ${conta.conta_bancaria_nome || "-"})`;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const split = doc.splitTextToSize(corpo, pageW - margin * 2);
        doc.text(split, margin, y);
        y += split.length * 4.8 + 6;

        // Linhas de assinatura
        const signY = pageH - 28;
        const signW = (pageW - margin * 2) / 2 - 8;
        const leftX = margin + 2;
        const rightX = margin + signW + 16;

        doc.setLineWidth(0.4);
        doc.line(leftX, signY, leftX + signW, signY); // pagador
        doc.line(rightX, signY, rightX + signW, signY); // recebedor

        doc.setFontSize(8);
        doc.text("Assinatura do Pagador", leftX + signW / 2, signY + 5, { align: "center" });
        doc.text("Assinatura do Recebedor", rightX + signW / 2, signY + 5, { align: "center" });

        const rodapeY = pageH - 8;
        doc.setFontSize(7);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, pageW - margin, rodapeY, { align: "right" });

        doc.save(`recibo_${conta.id || Date.now()}.pdf`);
    };




    // Função para gerar PDF
    const gerarPDF = () => {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 14;

        const drawWatermark = () => {
            try {
                doc.setGState(new doc.GState({ opacity: 0.1 }));
                const logoW = pageW * 0.5;
                const logoH = pageH * 0.5;
                const x = (pageW - logoW) / 2;
                const y = (pageH - logoH) / 2;
                doc.addImage(LogoMoacir, 'PNG', x, y, logoW, logoH);
                doc.setGState(new doc.GState({ opacity: 1 }));
            } catch (err) {
                console.warn("Erro ao adicionar marca d'água:", err);
            }
        };

        const columns = [
            { title: "Descrição", dataKey: "descricao" },
            { title: "Boleto", dataKey: "boleto" },
            { title: "Valor Pago", dataKey: "valor_pago" },
            { title: "Data de Pagamento", dataKey: "data_pagamento" },
            { title: "Origem", dataKey: "status" }
        ];

        // Cabeçalho
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text("Fazenda Aparecida do Norte", margin, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Rodovia MT 129 - KM 10 - Paranatinga - MT", margin, 30);
        doc.text("Tel: (67) 98124-7654", margin, 36);
        doc.text("Email: faz.aparecidadonorte@gmail.com", margin, 42);
        doc.setFontSize(12);
        doc.text(`Período: ${dataInicio ? formatarData(dataInicio) : 'Início'} a ${dataFim ? formatarData(dataFim) : 'Fim'}`, margin, 52);

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

            const rows = contasDoGrupo.map((conta) => ({
                descricao: conta.credor_nome + ' - ' + conta.descricao,
                boleto: conta.boleto || "-",
                valor_pago: formatarMoedaBRL(conta.valor_pago),
                data_pagamento: formatarData(conta.data_pagamento),
                status: conta.conta_bancaria_nome
            }));

            const valores = contasDoGrupo.map(conta => conta.valor_pago);
            const valorTotalGrupo = somarValoresMonetarios(valores);
            valorGeralTotal = Math.round((valorGeralTotal + valorTotalGrupo) * 100) / 100;

            // linha total do grupo
            rows.push({
                descricao: "",
                boleto: "",
                valor_pago: `Total (${metodo}): ${formatarMoedaBRL(valorTotalGrupo)}`,
                data_pagamento: "",
                status: ""
            });

            // título do grupo
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Método de Pagamento: ${metodo}`, margin, startY);

            // tabela
            doc.autoTable({
                startY: startY + 8,
                head: [columns.map(col => col.title)],
                body: rows.map(row => columns.map(col => row[col.dataKey])),
                didDrawPage: () => {
                    // 🔹 Marca d’água acima de tudo em todas as páginas
                    drawWatermark();
                }
            });

            startY = doc.lastAutoTable.finalY + 15;

            // nova página se necessário
            if (startY > 190 && index < Object.keys(grupos).length - 1) {
                doc.addPage('landscape');
                startY = 20;
            }
        });

        // valor geral total
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');

        // Garante que o texto fique dentro da página, mesmo em relatórios de 1 página
        const finalY = doc.lastAutoTable && doc.lastAutoTable.finalY
            ? doc.lastAutoTable.finalY
            : startY;
        const maxY = pageH - margin;
        let textoY = finalY + 5;

        if (textoY > maxY) {
            doc.addPage('landscape');
            // adiciona marca d'água também nesta nova página
            drawWatermark();
            textoY = margin + 5;
        }

        doc.text(`Valor Geral Total: ${formatarMoedaBRL(valorGeralTotal)}`, margin, textoY);

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
                    <input
                        className="input-geral"
                        type="text"
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        maxLength="150"
                    />
                    <label htmlFor="credorNome">Nome Credor</label>
                    <input
                        className="input-geral"
                        type="text"
                        id="credorNome"
                        value={credorNome}
                        onChange={(e) => setCredorNome(e.target.value)}
                        maxLength="150"
                    />

                    <div>
                        <label htmlFor="credorCpfCnpj">CPF/CNPJ</label>
                        <input
                            className="input-geral"
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
                                <th>Ações</th> {/* 🔹 nova coluna */}
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
                                    <td>
                                        <button
                                            className="edit-button"
                                            onClick={() => emitirRecibo(conta)}
                                        >
                                            Recibo
                                        </button>
                                        <button
                                            className="edit-button"
                                            onClick={() => handleEditarData(conta)}
                                        >
                                            Editar Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalEditarDataPagamento
                isOpen={isModalEditarDataOpen}
                onClose={() => {
                    setIsModalEditarDataOpen(false);
                    setContaSelecionada(null);
                }}
                onSubmit={handleSalvarNovaData}
                conta={contaSelecionada}
            />
            {toast.message && <Toast message={toast.message} type={toast.type} />}
        </div>

    );
}

export default ContasPagas;