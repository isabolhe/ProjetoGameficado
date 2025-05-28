document.addEventListener("DOMContentLoaded", () => {
  const totalPontosElem = document.getElementById("totalPontos");
  const atividadesConcluidasElem = document.getElementById("atividadesConcluidas");
  const atividadesPendentesElem = document.getElementById("atividadesPendentes");
  const percentualAtividadesPositivasElem = document.getElementById("percentualAtividadesPositivas");
  const selectFilho = document.getElementById("selectFilho");

  const ctxDonut = document.getElementById("graficoPontosRelatorio")?.getContext("2d");
  const ctxColunas = document.getElementById("graficoColunas")?.getContext("2d");

  let chartDonut = null;
  let chartColunas = null;

  let filhos = [];
  let atividadesCounts = [];
  let todasAtividades = [];

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
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchTodasAtividades() {
    try {
      const response = await fetch("http://localhost:3000/atividades", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      });
      if (!response.ok) throw new Error("Erro ao buscar atividades");
      todasAtividades = await response.json();
    } catch (error) {
      console.error(error);
    }
  }

  function getAtividadesCountByFilho(idFilho) {
    if (idFilho === "all") {
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

  function filtrarAtividadesPorFilho(idFilho) {
    if (idFilho === "all") {
      return todasAtividades;
    }
    return todasAtividades.filter(a => a.filho_id === parseInt(idFilho));
  }

  function atualizarResumo() {
    if (!selectFilho) return;
    const idFilhoSelecionado = selectFilho.value;
    const counts = getAtividadesCountByFilho(idFilhoSelecionado);

    if (atividadesConcluidasElem) atividadesConcluidasElem.textContent = counts.totalConcluidas;
    if (atividadesPendentesElem) atividadesPendentesElem.textContent = counts.totalPendentes;
    if (totalPontosElem) totalPontosElem.textContent = (counts.totalPontos > 0 ? "+" : "") + counts.totalPontos;

    atualizarGraficoDonut(counts.totalConcluidas, counts.totalPendentes);
    atualizarGraficoColunasPorData(idFilhoSelecionado);
    calcularPercentualAtividadesPositivas(idFilhoSelecionado);
  }

  function calcularPercentualAtividadesPositivas(idFilho) {
    const atividadesFiltradas = filtrarAtividadesPorFilho(idFilho);
    const positivas = atividadesFiltradas.filter(a => a.concluida && a.pontuacao > 0).length;
    const concluidas = atividadesFiltradas.filter(a => a.concluida).length;
    const percentual = concluidas > 0 ? Math.round((positivas / concluidas) * 100) : 0;
    if (percentualAtividadesPositivasElem) percentualAtividadesPositivasElem.textContent = percentual + "%";
  }

  function atualizarGraficoDonut(concluidas, pendentes) {
    if (!ctxDonut) return;

    const data = [concluidas, pendentes];
    const labels = ["Concluídas", "Pendentes"];
    const backgroundColors = ["#2196f3", "#fb913b"];

    if (chartDonut) chartDonut.destroy();

    chartDonut = new Chart(ctxDonut, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
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

  function atualizarGraficoColunasPorData(idFilho) {
    if (!ctxColunas) return;

    const atividadesFiltradas = filtrarAtividadesPorFilho(idFilho);
    console.log("Atividades filtradas para gráfico de colunas:", atividadesFiltradas);

    const pontosConcluidosPorData = {};

    atividadesFiltradas.forEach(a => {
      console.log("Processando atividade:", a);
      const data = new Date(a.data_limite);
      if (isNaN(data)) {
        console.warn("Data inválida para atividade:", a);
        return;
      }
      const label = data.toLocaleDateString("pt-BR");

      if (a.concluida) {
        if (!pontosConcluidosPorData[label]) pontosConcluidosPorData[label] = 0;
        pontosConcluidosPorData[label] += a.pontuacao;
      }
    });

    console.log("Pontos concluídos por data:", pontosConcluidosPorData);

    const labelsOrdenadas = Object.keys(pontosConcluidosPorData).sort((a, b) => {
      const [diaA, mesA, anoA] = a.split("/");
      const [diaB, mesB, anoB] = b.split("/");
      return new Date(`${anoA}-${mesA}-${diaA}`) - new Date(`${anoB}-${mesB}-${diaB}`);
    });

    const dadosConcluidos = labelsOrdenadas.map(label => pontosConcluidosPorData[label] || 0);

    // Update or create the table with points data (only completed points)
    const tabelaPontos = document.getElementById("tabelaPontos");
    if (tabelaPontos) {
      // Clear existing rows except header
      while (tabelaPontos.rows.length > 1) {
        tabelaPontos.deleteRow(1);
      }
      labelsOrdenadas.forEach((label, index) => {
        const row = tabelaPontos.insertRow();
        const cellData = row.insertCell(0);
        const cellConcluidos = row.insertCell(1);
        cellData.textContent = label;
        cellConcluidos.textContent = dadosConcluidos[index];
        // Remove pending points column cells
        const cellPendentes = row.insertCell(2);
        cellPendentes.textContent = "-";
      });
    }

    if (chartColunas) {
      chartColunas.destroy();
      ctxColunas.clearRect(0, 0, ctxColunas.canvas.width, ctxColunas.canvas.height);
    }

    chartColunas = new Chart(ctxColunas, {
      type: "bar",
      data: {
        labels: labelsOrdenadas,
        datasets: [
          {
            label: "Pontos Concluídos",
            data: dadosConcluidos,
            backgroundColor: "#2196f3"
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        },
        plugins: {
          legend: { display: true, position: "bottom" },
          tooltip: {
            callbacks: {
              label: context => {
                const idx = context.dataIndex;
                const datasetLabel = context.dataset.label || "";
                const value = context.parsed.y;
                return `${datasetLabel}: ${value}`;
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  if (selectFilho) {
    selectFilho.addEventListener("change", () => {
      atualizarResumo();
    });
  }

  async function init() {
    await fetchFilhos();
    await fetchAtividadesCounts();
    await fetchTodasAtividades();
    atualizarResumo();
  }

  init();
});
