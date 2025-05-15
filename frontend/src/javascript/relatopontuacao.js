document.addEventListener("DOMContentLoaded", () => {
    const totalPontosElem = document.getElementById("totalPontos");
    const atividadesConcluidasElem = document.getElementById("atividadesConcluidas");
    const atividadesPendentesElem = document.getElementById("atividadesPendentes");
    const ctx = document.getElementById("graficoPontosRelatorio") ? document.getElementById("graficoPontosRelatorio").getContext("2d") : null;
    const ctxDesempenho = document.getElementById("graficoDesempenhoTempo") ? document.getElementById("graficoDesempenhoTempo").getContext("2d") : null;
    const selectFilho = document.getElementById("selectFilho");

    let filhos = [];
    let atividades = [];

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

    async function fetchAtividades() {
        try {
            const response = await fetch("http://localhost:3000/atividades", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (!response.ok) throw new Error("Erro ao buscar atividades");
            atividades = await response.json();
            atualizarResumo();
            atualizarGraficoDesempenho();
        } catch (error) {
            console.error(error);
        }
    }

    function filtrarAtividadesPorFilho(idFilho) {
        if (idFilho === "all") {
            return atividades;
        }
        return atividades.filter(a => a.filho_id === parseInt(idFilho));
    }

    function atualizarResumo() {
        if (!selectFilho) return;
        const idFilhoSelecionado = selectFilho.value;
        const atividadesFiltradas = filtrarAtividadesPorFilho(idFilhoSelecionado);

        const concluidas = atividadesFiltradas.filter(a => a.concluida === true);
        const pendentes = atividadesFiltradas.filter(a => a.concluida === false);
        const totalPontos = concluidas.reduce((acc, a) => acc + a.pontuacao, 0);

        if (atividadesConcluidasElem) atividadesConcluidasElem.textContent = concluidas.length;
        if (atividadesPendentesElem) atividadesPendentesElem.textContent = pendentes.length;
        if (totalPontosElem) totalPontosElem.textContent = (totalPontos > 0 ? '+' : '') + totalPontos;

        atualizarGrafico(concluidas, pendentes);
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
        await fetchAtividades();
    }

    init();
});
