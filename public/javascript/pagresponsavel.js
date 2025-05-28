function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

const API_BASE = 'http://localhost:3000';

async function carregarResumoFilhos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/filhos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const filhos = await response.json();

    const divNenhum = document.getElementById('nenhumFilho');
    const divResumo = document.getElementById('filhosResumo');
    const btnCriarAtividade1 = document.querySelector('a[href="criarnatividade.html"]');
    const btnCriarAtividade2 = document.querySelector('.nav-link[href="criarnatividade.html"]');

    let temFilhos = Array.isArray(filhos) && filhos.length > 0;

    if (!temFilhos) {
      divNenhum.style.display = 'block';
      divResumo.classList.add('d-none');

      const bloquear = (e) => {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Atenção',
          text: 'Você precisa cadastrar ao menos um filho antes de criar uma nova atividade.',
          showCancelButton: true,
          confirmButtonText: 'Cadastrar Filho',
          cancelButtonText: 'Fechar'
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = 'osfilhos.html';
          }
        });
      };

      btnCriarAtividade1?.addEventListener('click', bloquear);
      btnCriarAtividade2?.addEventListener('click', bloquear);
      return;
    }

    divNenhum.style.display = 'none';
    document.getElementById('adicionarFilho').style.display = 'none';
    divResumo.classList.remove('d-none');
    divResumo.innerHTML = '';

    filhos.forEach(filho => {
      const filhoInfo = document.createElement('div');
      filhoInfo.className = 'p-2 border rounded mb-2 bg-light';
      filhoInfo.innerHTML = `
        <strong>${filho.nome}</strong><br>
        <small>${filho.email}</small>
      `;
      divResumo.appendChild(filhoInfo);
    });

    // New code to update resumoTotalPontos and percentualAtividadesPositivas
    const resumoTotalPontosElem = document.getElementById('resumoTotalPontos');
    const percentualAtividadesPositivasElem = document.getElementById('percentualAtividadesPositivas');

    // Calculate total points from filhos array
    const totalPontos = filhos.reduce((acc, filho) => acc + (filho.pontos || 0), 0);
    if (resumoTotalPontosElem) {
      resumoTotalPontosElem.textContent = (totalPontos > 0 ? '+' : '') + totalPontos;
    }

    // Fetch percentage of positive completed activities
    try {
      const responsePercentual = await fetch(`${API_BASE}/atividades/porcentagem-positivas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (responsePercentual.ok) {
        const percentualData = await responsePercentual.json();
        // Calculate overall percentage (weighted average or simple average)
        let totalConcluidas = 0;
        let totalPositivas = 0;
        percentualData.forEach(item => {
          const porcentagem = parseFloat(item.porcentagem_positivas);
          if (!isNaN(porcentagem)) {
            totalPositivas += porcentagem;
            totalConcluidas++;
          }
        });
        const percentualGeral = totalConcluidas > 0 ? Math.round(totalPositivas / totalConcluidas) : 0;
        if (percentualAtividadesPositivasElem) {
          percentualAtividadesPositivasElem.textContent = percentualGeral + '%';
        }
      } else {
        console.error('Erro ao buscar porcentagem de atividades positivas');
      }
    } catch (error) {
      console.error('Erro ao buscar porcentagem de atividades positivas:', error);
    }

  } catch (error) {
    console.error('Erro ao carregar filhos:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar os filhos. Tente novamente mais tarde.'
    });
  }
}

async function carregarPremios() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/premios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar prêmios');
    }

    const premios = await response.json();
    const container = document.getElementById('prizesContainer');
    container.innerHTML = '';

    if (premios.length === 0) {
      container.innerHTML = '<div class="text-muted">Nenhum prêmio cadastrado.</div>';
      return;
    }

    premios.forEach(premio => {
      console.log('Premio:', premio);
      const div = document.createElement('div');
      div.classList.add('card', 'p-3', 'm-2');

      div.style.flex = '0 0 calc(33.333% - 1rem)';
      div.style.boxSizing = 'border-box';
      div.style.border = '1px solid #ccc'; // lighter and less pronounced border

      // Check if premio.emoji is an emoji (length 2 or less and no dot), else treat as image URL
      const isEmoji = premio.emoji && premio.emoji.length <= 2 && !premio.emoji.includes('.');

      let emojiHtml = '';
      if (isEmoji) {
        emojiHtml = `<div style="background: #f0e6ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; min-width: 120px; min-height: 100px; margin-bottom: 10px; user-select: none; width: fit-content; padding: 0 0.5rem; margin-left: auto; margin-right: auto;">${premio.emoji}</div>`;
      } else if (premio.emoji && premio.emoji !== premio.nome) {
        // Only render image if premio.emoji is not the same as premio.nome (to avoid showing name as image)
        emojiHtml = `<img src="${premio.emoji}" alt="${premio.nome}" style="height: 60px; margin-bottom: 10px; align-self: center;">`;
      } else {
        // If premio.emoji is same as premio.nome or empty, render empty div to keep layout
        emojiHtml = `<div style="height: 60px; width: 60px; margin-bottom: 10px;"></div>`;
      }

      div.innerHTML = `
        ${emojiHtml}
        <h5 class="fw-bold">${premio.nome}</h5>
        <p class="text-muted mb-2" style="font-size: 0.9rem;">${premio.descricao}</p>
        <div class="d-flex justify-content-between align-items-center mt-auto">
          <span class="badge bg-dark">${premio.pontos_necessarios} pontos</span>
          <button class="btn btn-sm btn-purple">Resgatar</button>
        </div>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    console.error('Erro ao carregar prêmios:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar os prêmios. Tente novamente mais tarde.'
    });
  }
}


async function carregarAtividadesRecentes() {
  try {
    const token = localStorage.getItem('token');
    const responseFilhos = await fetch(`${API_BASE}/filhos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const filhos = await responseFilhos.json();

    const atividadesCard = document.querySelector('.col-md-6 > .card.p-3 > h5 + div.text-center.py-5.text-muted, .col-md-6 > .card.p-3 > div.text-center.py-5.text-muted');

    if (!filhos || filhos.length === 0) {
      if (atividadesCard) {
        atividadesCard.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade criada ainda.</div>';
      }
      atualizarResumo([]);
      return;
    }

    const responseAtividades = await fetch(`${API_BASE}/atividades/recentes`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const atividades = await responseAtividades.json();

    if (!atividades || atividades.length === 0) {
      if (atividadesCard) {
        atividadesCard.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade criada ainda.</div>';
      }
      atualizarResumo([]);
      return;
    }

    if (atividadesCard) {
      atividadesCard.innerHTML = '';
      atividades.forEach(atividade => {
        const div = document.createElement('div');
        div.className = 'p-3 mb-2 rounded shadow-sm d-flex flex-column align-items-start';
        div.style.backgroundColor = '#f8f9fa'; // set to page background color
        div.style.border = '1px solid #d3d3d3'; // thin light gray border
        div.style.color = atividade.pontuacao > 0 ? '#1976d2' : '#fb8c00'; // texto
        div.style.borderRadius = '0.5rem';
        div.style.padding = '0.75rem';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `
          <div class="atividade-info text-muted" style="text-align: left;">
            <strong>${atividade.titulo}</strong>
          </div>
          <div style="margin-top: 0.5rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 1rem; white-space: nowrap;">
              <span style="color: ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'}; font-weight: 600; white-space: nowrap;">
                ⭐ ${atividade.pontuacao < 0 ? '-' : ''}${Math.abs(atividade.pontuacao)} pontos
              </span>
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.9rem; color: #555; white-space: nowrap; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 0.5rem;">
                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
                <path fill-rule="evenodd" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
              <span>${atividade.nome_filho}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style="margin-left: 1rem; margin-right: 0.5rem;">
                <path d="M8 3.5a.5.5 0 0 1 .5.5v4l3 1.5a.5.5 0 0 1-.5.866L8 8.5V4a.5.5 0 0 1 .5-.5z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z"/>
              </svg>
              <span>${new Date(atividade.data_limite).toLocaleDateString()}</span>
            </div>
            <div>
              ${atividade.concluida ? '<button class="btn btn-secondary btn-sm" disabled>Concluído</button>' : `<button class="btn btn-sm btn-confirmar" style="background-color: ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'}; color: white; border: none;" data-id="${atividade.id}">Concluir</button>`}
            </div>
          </div>
        `;
        atividadesCard.appendChild(div);
      });

      document.querySelectorAll('.btn-confirmar').forEach(button => {
        button.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          try {
            const confirmResponse = await fetch(`${API_BASE}/atividades/${id}/confirmar`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (confirmResponse.ok) {
              Swal.fire({
                icon: 'success',
                title: 'Sucesso',
                text: 'Atividade confirmada com sucesso!',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
              });
              carregarAtividadesRecentes();
              window.location.reload();
            } else {
              const errorData = await confirmResponse.json();
              Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: 'Erro ao confirmar atividade: ' + (errorData.error || 'Erro desconhecido'),
              });
            }
          } catch (error) {
            console.error('Erro ao confirmar atividade:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erro',
              text: 'Erro ao confirmar atividade. Tente novamente mais tarde.'
            });
          }
        });
      });
    }

    atualizarResumo(atividades);

  } catch (error) {
    console.error('Erro ao carregar atividades recentes:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar as atividades recentes. Tente novamente mais tarde.'
    });
  }
}

function atualizarResumo(atividades) {
  const concluidas = atividades.filter(a => a.concluida === true);
  const pendentes = atividades.filter(a => a.concluida === false);
  const totalPontos = concluidas.reduce((acc, a) => acc + a.pontuacao, 0);

  const atividadesConcluidasElem = document.getElementById("atividadesConcluidas");
  const atividadesPendentesElem = document.getElementById("atividadesPendentes");
  const totalPontosElem = document.getElementById("totalPontos");

  if (atividadesConcluidasElem) atividadesConcluidasElem.textContent = concluidas.length;
  if (atividadesPendentesElem) atividadesPendentesElem.textContent = pendentes.length;
  if (totalPontosElem) totalPontosElem.textContent = (totalPontos > 0 ? '+' : '') + totalPontos;
}

document.addEventListener('DOMContentLoaded', () => {
  carregarResumoFilhos();
  carregarAtividadesRecentes();
  carregarPremios();

  // Additional script to forcibly override padding and margin of activity divs after load
  setTimeout(() => {
    const atividadeDivs = document.querySelectorAll('#atividadesList > div');
    atividadeDivs.forEach(div => {
      div.style.padding = '0.5rem 0.75rem';
      div.style.marginBottom = '0.25rem';
    });
  }, 1000);

  // Pontuação modal logic
  const btnCriarCard = document.getElementById("btnCriarCard");
  const pontuacaoModal = new bootstrap.Modal(document.getElementById("pontuacaoModal"));
  const selectFilhoModal = document.getElementById("selectFilhoModal");
  const atividadesConcluidasModal = document.getElementById("atividadesConcluidasModal");
  const atividadesPendentesModal = document.getElementById("atividadesPendentesModal");
  const totalPontosModal = document.getElementById("totalPontosModal");
  const ctxModal = document.getElementById("graficoPontosRelatorioModal") ? document.getElementById("graficoPontosRelatorioModal").getContext("2d") : null;
  const ctxDesempenhoModal = document.getElementById("graficoDesempenhoTempoModal") ? document.getElementById("graficoDesempenhoTempoModal").getContext("2d") : null;

  const ctxMainPontos = document.getElementById("graficoPontosRelatorio") ? document.getElementById("graficoPontosRelatorio").getContext("2d") : null;
  const ctxMainColunas = document.getElementById("graficoColunas") ? document.getElementById("graficoColunas").getContext("2d") : null;

let filhos = [];
let atividadesCounts = [];
let atividades = []; // store fetched activities globally

let chartModal = null;
let chartDesempenhoModal = null;
let chartMainPontos = null;
let chartMainColunas = null;

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
    if (!selectFilhoModal) return;
    // Clear existing options except "Todos"
    selectFilhoModal.innerHTML = '<option value="all" selected>Todos</option>';
    filhos.forEach(filho => {
      const option = document.createElement("option");
      option.value = filho.id;
      option.textContent = filho.nome;
      selectFilhoModal.appendChild(option);
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
      atualizarGraficoMain();
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
    if (!selectFilhoModal) return;
    const idFilhoSelecionado = selectFilhoModal.value;
    const counts = getAtividadesCountByFilho(idFilhoSelecionado);

    if (atividadesConcluidasModal) atividadesConcluidasModal.textContent = counts.totalConcluidas;
    if (atividadesPendentesModal) atividadesPendentesModal.textContent = counts.totalPendentes;
    if (totalPontosModal) totalPontosModal.textContent = (counts.totalPontos > 0 ? '+' : '') + counts.totalPontos;

    atualizarGrafico(counts.totalConcluidas, counts.totalPendentes);
  }

  function atualizarGrafico(concluidas, pendentes) {
    if (!ctxModal) return;
    const labels = ["Concluídas", "Pendentes"];
    const data = [concluidas, pendentes];
    const backgroundColors = ["#2196f3", "#fb913b"];

    if (chartModal) {
      chartModal.destroy();
    }

    chartModal = new Chart(ctxModal, {
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
    if (!ctxDesempenhoModal) return;

    const idFilhoSelecionado = selectFilhoModal ? selectFilhoModal.value : "all";
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

    if (chartDesempenhoModal) {
      chartDesempenhoModal.destroy();
    }

    chartDesempenhoModal = new Chart(ctxDesempenhoModal, {
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

  function atualizarGraficoMain() {
    if (!ctxMainPontos || !ctxMainColunas) return;

    const idFilhoSelecionado = selectFilhoModal ? selectFilhoModal.value : "all";
    const counts = getAtividadesCountByFilho(idFilhoSelecionado);

    // Doughnut chart for atividades concluídas vs pendentes (swapped)
    const dataAtividades = [counts.totalConcluidas, counts.totalPendentes];
    const backgroundColorsAtividades = ["#2196f3", "#fb913b"];

    if (chartMainPontos) {
      chartMainPontos.destroy();
    }

    chartMainPontos = new Chart(ctxMainPontos, {
      type: "doughnut",
      data: {
        labels: ["Concluídas", "Pendentes"],
        datasets: [{
          data: dataAtividades,
          backgroundColor: backgroundColorsAtividades
        }]
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

    // Bar chart for pontos diários (swapped)
    // Group points by date (data_limite)
    const atividadesFiltradas = filtrarAtividadesPorFilho(idFilhoSelecionado);

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

    const datas = Object.keys(pontosPorData).sort((a, b) => new Date(a) - new Date(b));
    const pontos = datas.map(d => pontosPorData[d]);

    if (chartMainColunas) {
      chartMainColunas.destroy();
    }

    chartMainColunas = new Chart(ctxMainColunas, {
      type: "bar",
      data: {
        labels: datas,
        datasets: [{
          label: "Pontos Diários",
          data: pontos,
          backgroundColor: "#2196f3"
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            precision: 0
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

function filtrarAtividadesPorFilho(idFilho) {
  if (idFilho === "all") {
    return atividades;
  }
  return atividades.filter(a => a.filho_id === parseInt(idFilho));
}

  if (selectFilhoModal) {
    selectFilhoModal.addEventListener("change", () => {
      atualizarResumo();
      atualizarGraficoDesempenho();
      atualizarGraficoMain();
    });
  }

  if (btnCriarCard) {
    btnCriarCard.addEventListener("click", () => {
      pontuacaoModal.show();
      // Initialize data fetch and rendering when modal is shown
      fetchFilhos().then(() => fetchAtividadesCounts());
    });
  }

  // Initial call to update main charts after data is loaded
  fetchFilhos().then(() => fetchAtividadesCounts());
});
