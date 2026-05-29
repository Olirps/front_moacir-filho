import React, { useState, useEffect } from 'react';
import { getContasPagas, updateDataPagamento } from '../services/api';
import { formatarData, formatarMoedaBRL, somarValoresMonetarios } from '../utils/functions';
import { cpfCnpjMask, removeMaks } from '../components/utils'; // mantive a ortografia original
import LogoMoacir from '../img/LogoMoacir.png';
import ModalEditarDataPagamento from '../components/ModalEditarDataPagamento';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../utils/hasPermission';
import '../styles/ContasPagas.css';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ContasPagas() {
    const [contasPagas, setContasPagas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros
    const [descricao, setDescricao] = useState('');
    const [credorNome, setCredorNome] = useState('');
    const [credorCpfCnpj, setCredorCpfCnpj] = useState('');
    const [origem, setOrigem] = useState(''); // NOVO: Filtro de Origem
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');

    const [contasFiltradas, setContasFiltradas] = useState([]);
    const [itensVisiveis, setItensVisiveis] = useState(50); // NOVO: Controle de paginação (Infinite Scroll)

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
                setItensVisiveis(50); // Garante início com 50 itens
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
        const filtradas = contasPagas.filter((conta) => {
            const dataPagamento = new Date(conta.data_pagamento);
            const inicio = dataInicio ? new Date(dataInicio) : null;
            const fim = dataFim ? new Date(dataFim) : null;

            // Converte os filtros de texto para minúsculas
            const filtroCredorCpfCnpj = credorCpfCnpj ? credorCpfCnpj.toLowerCase() : "";
            const filtroCredorNome = credorNome ? credorNome.toLowerCase() : "";
            const filtroDescricao = descricao ? descricao.toLowerCase() : "";
            const filtroOrigem = origem ? origem.toLowerCase() : ""; // NOVO

            // Dados da conta em minúsculas
            const credorCpfCnpjConta = conta.credor_cpfcnpj ? conta.credor_cpfcnpj.toLowerCase() : "";
            const credorNomeConta = conta.credor_nome ? conta.credor_nome.toLowerCase() : "";
            const descricaoConta = conta.descricao ? conta.descricao.toLowerCase() : "";
            const origemConta = conta.conta_bancaria_nome ? conta.conta_bancaria_nome.toLowerCase() : ""; // NOVO

            const dataValida = (!inicio || dataPagamento >= inicio) && (!fim || dataPagamento <= fim);
            const credorCpfCnpjValido = !filtroCredorCpfCnpj || credorCpfCnpjConta.includes(filtroCredorCpfCnpj);
            const credorNomeValido = !filtroCredorNome || credorNomeConta.includes(filtroCredorNome);
            const descricaoValida = !filtroDescricao || descricaoConta.includes(filtroDescricao);
            const origemValida = !filtroOrigem || origemConta.includes(filtroOrigem); // NOVO

            return dataValida && credorCpfCnpjValido && credorNomeValido && descricaoValida && origemValida;
        });

        setContasFiltradas(filtradas);
        setItensVisiveis(50); // NOVO: Reseta a paginação ao filtrar
    };

    // Função para limpar os filtros
    const limparFiltros = () => {
        setDataInicio('');
        setDataFim('');
        setDescricao('');
        setCredorNome('');
        setCredorCpfCnpj('');
        setOrigem(''); // NOVO
        setContasFiltradas(contasPagas);
        setItensVisiveis(50); // NOVO: Reseta a paginação ao limpar filtros
    };

    // NOVO: Handler do Infinite Scroll
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // Se chegou no final da rolagem (margem de 10px por segurança)
        if (scrollHeight - scrollTop <= clientHeight + 10) {
            if (itensVisiveis < contasFiltradas.length) {
                setItensVisiveis((prev) => prev + 50);
            }
        }
    };

    /**
     * Gera recibo compacto confirmando que o EMITENTE pagou o CREDOR.
     */
    const emitirRecibo = (conta, options = {}) => {
        // ... (Mantido exatamente igual ao seu código original)
        const {
            emitenteNome = "Fazenda Aparecida do Norte",
            emitenteCnpj = "",
            format = [180, 100]
        } = options;

        const doc = new jsPDF({ orientation: "landscape", unit: "mm", format });

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

        const signY = pageH - 28;
        const signW = (pageW - margin * 2) / 2 - 8;
        const leftX = margin + 2;
        const rightX = margin + signW + 16;

        doc.setLineWidth(0.4);
        doc.line(leftX, signY, leftX + signW, signY);
        doc.line(rightX, signY, rightX + signW, signY);

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
        // ... (Mantido exatamente igual ao seu código original)
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
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

            rows.push({
                descricao: "", boleto: "", valor_pago: `Total (${metodo}): ${formatarMoedaBRL(valorTotalGrupo)}`, data_pagamento: "", status: ""
            });

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Método de Pagamento: ${metodo}`, margin, startY);

            doc.autoTable({
                startY: startY + 8,
                head: [columns.map(col => col.title)],
                body: rows.map(row => columns.map(col => row[col.dataKey])),
                didDrawPage: () => drawWatermark()
            });

            startY = doc.lastAutoTable.finalY + 15;
            if (startY > 190 && index < Object.keys(grupos).length - 1) {
                doc.addPage('landscape');
                startY = 20;
            }
        });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        const finalY = doc.lastAutoTable && doc.lastAutoTable.finalY ? doc.lastAutoTable.finalY : startY;
        const maxY = pageH - margin;
        let textoY = finalY + 5;

        if (textoY > maxY) {
            doc.addPage('landscape');
            drawWatermark();
            textoY = margin + 5;
        }

        doc.text(`Valor Geral Total: ${formatarMoedaBRL(valorGeralTotal)}`, margin, textoY);
        doc.save("contas_pagas.pdf");
    };

    // Resumo e Paginação local
    const totalRegistros = contasFiltradas.length;
    const totalValorPago = somarValoresMonetarios(contasFiltradas.map(c => c.valor_pago));

    // NOVO: Array fragmentado para não estourar o DOM (Lazy Render)
    const contasRenderizadas = contasFiltradas.slice(0, itensVisiveis);

    if (loading) return <div className="spinner-container"><div className="spinner"></div></div>;
    if (error) return <div>Erro: {error}</div>;

    return (
        <div className="contas-pagas-page">
            <h1 className="title-page">Contas Pagas</h1>
            <p className="page-subtitle">Visualize, filtre e exporte os pagamentos já realizados.</p>

            <div id="search-container" className="contas-pagas-filters-card">
                <div id="search-fields">
                    <div className="filter-field">
                        <label htmlFor="descricao">Descrição</label>
                        <input className="input-geral" type="text" id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength="150" placeholder="Ex.: Energia, aluguel..." />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="credorNome">Nome Credor</label>
                        <input className="input-geral" type="text" id="credorNome" value={credorNome} onChange={(e) => setCredorNome(e.target.value)} maxLength="150" placeholder="Nome do credor" />
                    </div>
                    <div className="filter-field">
                        <label htmlFor="credorCpfCnpj">CPF/CNPJ</label>
                        <input className="input-geral" type="text" id="credorCpfCnpj" value={cpfCnpjMask(credorCpfCnpj)} onChange={(e) => setCredorCpfCnpj(removeMaks(e.target.value))} maxLength="18" placeholder="Somente números" />
                    </div>
                    {/* NOVO: Filtro Origem */}
                    <div className="filter-field">
                        <label htmlFor="origem">Origem</label>
                        <input className="input-geral" type="text" id="origem" value={origem} onChange={(e) => setOrigem(e.target.value)} maxLength="150" placeholder="Ex.: Bradesco, Caixa..." />
                    </div>
                    <div className="filter-field">
                        <label>Data de Início</label>
                        <input className="input-geral" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                    </div>
                    <div className="filter-field">
                        <label>Data de Fim</label>
                        <input className="input-geral" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                    </div>
                </div>

                <div id='button-group' className="filters-actions">
                    <button className="button" onClick={aplicarFiltro}>Filtrar</button>
                    <button className="button" onClick={limparFiltros}>Limpar</button>
                    <button className="button" onClick={gerarPDF}>Imprimir</button>
                </div>
            </div>

            <div id="separator-bar"></div>

            <div className="resume-bar">
                <span>{totalRegistros} registro(s) encontrado(s)</span>
                <span>Total pago: {formatarMoedaBRL(totalValorPago)}</span>
            </div>

            <div id="results-container">
                {/* NOVO: Evento onScroll adicionado aqui */}
                <div id="grid-padrao-container" className="contas-pagas-grid-wrapper" onScroll={handleScroll}>
                    <table id="grid-padrao" className="contas-pagas-grid">
                        <thead>
                            <tr>
                                <th>Credor</th>
                                <th>Descrição</th>
                                <th>Valor Pago</th>
                                <th>Data de Pagamento</th>
                                <th>Método</th>
                                <th>Origem</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* NOVO: Agora mapeamos contasRenderizadas, não contasFiltradas inteira */}
                            {contasRenderizadas.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="empty-message">Nenhuma conta paga encontrada com os filtros atuais.</td>
                                </tr>
                            ) : (
                                contasRenderizadas.map((conta) => (
                                    <tr key={conta.id}>
                                        <td className="col-credor">{conta.credor_nome}</td>
                                        <td className="col-descricao">{conta.descricao}</td>
                                        <td className="col-valor">{formatarMoedaBRL(conta.valor_pago)}</td>
                                        <td>{formatarData(conta.data_pagamento)}</td>
                                        <td><span className="badge badge-metodo">{conta.metodo_pagamento}</span></td>
                                        <td><span className="badge badge-origem">{conta.conta_bancaria_nome}</span></td>
                                        <td>
                                            <div className="acoes-buttons">
                                                <button className="edit-button" onClick={() => emitirRecibo(conta)}>Recibo</button>
                                                <button className="edit-button" onClick={() => handleEditarData(conta)}>Editar Data</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ModalEditarDataPagamento
                isOpen={isModalEditarDataOpen}
                onClose={() => { setIsModalEditarDataOpen(false); setContaSelecionada(null); }}
                onSubmit={handleSalvarNovaData}
                conta={contaSelecionada}
            />
            {toast.message && <Toast message={toast.message} type={toast.type} />}
        </div>
    );
}

export default ContasPagas;