document.addEventListener("DOMContentLoaded", () => {
    const totalPontosElem = document.getElementById("totalPontos");
    const atividadesConcluidasElem = document.getElementById("atividadesConcluidas");
    const atividadesPendentesElem = document.getElementById("atividadesPendentes");
    const ctx = document.getElementById("graficoPontosRelatorio") ? document.getElementById("graficoPontosRelatorio").getContext("2d") : null;
    const ctxDesempenho = document.getElementById("graficoDesempenhoTempo") ? document.getElementById("graficoDesempenhoTempo").getContext("2d") : null;
    const selectFilho = document.getElementById("selectFilho");

    let filhos = [];
    let atividadesCounts = [];

    let chart = null;
    let chartDesempenho = null;

    async function fetchFilhos() {
        try {
            const response = await fetch("http://localhost:3000/filhos", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (!response.ok) throw new Error("Erro ao buscar filhos");
            filhos = await response.json();
            popularSelectFilho();
        } catch (error) {
            console.error(error);
        }
    }

    function popularSelectFilho() {
        if (!selectFilho) return;
        // Clear existing options except "Todos"
        selectFilho.innerHTML = '<option value="all" selected>Todos</option>';
        filhos.forEach(filho => {
            const option = document.createElement("option");
            option.value = filho.id;
            option.textContent = filho.nome;
            selectFilho.appendChild(option);
        });
    }

    async function fetchAtividadesCounts() {
        try {
            const response = await fetch("http://localhost:3000/atividades/concluidas/count", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (!response.ok) throw new Error("Erro ao buscar contagem de atividades");
            atividadesCounts = await response.json();
            atualizarResumo();
            atualizarGraficoDesempenho();
        } catch (error) {
            console.error(error);
        }
    }

    function getAtividadesCountByFilho(idFilho) {
        if (idFilho === "all") {
            // Aggregate counts for all filhos
            const totalConcluidas = atividadesCounts.reduce((acc, cur) => acc + (cur.total_concluidas || 0), 0);
            const totalPendentes = atividadesCounts.reduce((acc, cur) => acc + (cur.total_pendentes || 0), 0);
            const totalPontos = filhos.reduce((acc, cur) => acc + (cur.pontos || 0), 0);
            return { totalConcluidas, totalPendentes, totalPontos };
        }
        const filhoData = atividadesCounts.find(ac => ac.filho_id === parseInt(idFilho));
        const filhoPontos = filhos.find(f => f.id === parseInt(idFilho))?.pontos || 0;
        return {
            totalConcluidas: filhoData?.total_concluidas || 0,
            totalPendentes: filhoData?.total_pendentes || 0,
            totalPontos: filhoPontos
        };
    }

    function atualizarResumo() {
        if (!selectFilho) return;
        const idFilhoSelecionado = selectFilho.value;
        const counts = getAtividadesCountByFilho(idFilhoSelecionado);

        if (atividadesConcluidasElem) atividadesConcluidasElem.textContent = counts.totalConcluidas;
        if (atividadesPendentesElem) atividadesPendentesElem.textContent = counts.totalPendentes;
        if (totalPontosElem) totalPontosElem.textContent = (counts.totalPontos > 0 ? '+' : '') + counts.totalPontos;

        atualizarGrafico(counts.totalConcluidas, counts.totalPendentes);
    }

function atualizarGrafico(concluidas, pendentes) {
        if (!ctx) return;
        const labels = ["Concluídas", "Pendentes"];
        const data = [concluidas.length, pendentes.length];
        const backgroundColors = ["#2196f3", "#fb913b"];

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

function atualizarGraficoDesempenho() {
        if (!ctxDesempenho) return;

        const idFilhoSelecionado = selectFilho ? selectFilho.value : "all";
        const atividadesFiltradas = filtrarAtividadesPorFilho(idFilhoSelecionado);

        // Group points by date (data_limite)
        const pontosPorData = {};

        atividadesFiltradas.forEach(a => {
            if (a.concluida) {
                const data = new Date(a.data_limite).toLocaleDateString();
                if (!pontosPorData[data]) {
                    pontosPorData[data] = 0;
                }
                pontosPorData[data] += a.pontuacao;
            }
        });

        // Sort dates
        const datas = Object.keys(pontosPorData).sort((a, b) => new Date(a) - new Date(b));
        const pontos = datas.map(d => pontosPorData[d]);

        if (chartDesempenho) {
            chartDesempenho.destroy();
        }

        chartDesempenho = new Chart(ctxDesempenho, {
            type: "line",
            data: {
                labels: datas,
                datasets: [{
                    label: "Pontos ao longo do tempo",
                    data: pontos,
                    fill: false,
                    borderColor: "#2196f3",
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Data"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Pontos"
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    if (selectFilho) {
        selectFilho.addEventListener("change", () => {
            atualizarResumo();
            atualizarGraficoDesempenho();
        });
    }

    async function init() {
        await fetchFilhos();
        await fetchAtividadesCounts();
    }

    init();
});
