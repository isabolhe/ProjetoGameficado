document.addEventListener('DOMContentLoaded', () => {
  const nomeCompleto = localStorage.getItem('nomeResponsavel');
  const nomeSpan = document.getElementById('nomeResponsavel');

  if (nomeCompleto && nomeSpan) {
    const partes = nomeCompleto.trim().split(' ');
    const sobrenome = partes.length > 1 ? partes[partes.length - 1] : partes[0];
    nomeSpan.textContent = `Bem-vindo à família, ${sobrenome}!`;
  }
  
  carregarResumoFilhos();
  carregarAtividadesRecentes();
  carregarPremios();

});





function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// Define a URL base de forma dinâmica para funcionar local e na hospedagem (ex: Railway)
const baseURL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : `https://${window.location.hostname}`;

const API_BASE = baseURL;


// Função para carregar o resumo dos filhos e mostrar os pontos totais
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
    divResumo.classList.remove('d-none');
    divResumo.innerHTML = '';

    filhos.forEach(filho => {
      const atividadesConcluidas = filho.totalConcluidas || 0;
      const atividadesTotais = atividadesConcluidas + (filho.totalPendentes || 0);
      const percentual = atividadesTotais > 0 ? Math.round((atividadesConcluidas / atividadesTotais) * 100) : 0;
      const pontos = filho.pontos || 0;

      const filhoInfo = document.createElement('div');
      filhoInfo.className = 'filho-card';

      filhoInfo.innerHTML = `
        <div class="filho-header">
          <div class="filho-avatar">${filho.emoji || '👶'}</div>
          <div class="filho-info">
            <strong class="filho-nome">${filho.nome}</strong>
            <span class="filho-label">Progresso</span>
            <div class="barra-container">
              <div class="barra-texto">${atividadesConcluidas}/${atividadesTotais} atividades</div>
              <div class="barra-externa">
                <div class="barra-interna" style="width: ${percentual}%;"></div>
              </div>
              <div class="barra-pontos"> ${pontos} pontos</div>
            </div>
          </div>
        </div>
        <div class="filho-idade">${filho.idade || '?'} anos</div>
      `;

      divResumo.appendChild(filhoInfo);
    });

    const resumoTotalPontosElem = document.getElementById('resumoTotalPontos');
    const percentualAtividadesPositivasElem = document.getElementById('percentualAtividadesPositivas');

    const totalPontos = filhos.reduce((acc, filho) => acc + (filho.pontos || 0), 0);

    const totalPontosDisponiveisElem = document.getElementById('totalPontos');
    if (totalPontosDisponiveisElem) {
      totalPontosDisponiveisElem.textContent = totalPontos;
    } else {
      console.warn('Elemento com id="totalPontos" não encontrado no DOM.');
    }

    if (resumoTotalPontosElem) {
      resumoTotalPontosElem.textContent = totalPontos;
    }

    try {
      const responsePercentual = await fetch(`${API_BASE}/atividades/porcentagem-positivas`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (responsePercentual.ok) {
        const percentualData = await responsePercentual.json();
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
  container.innerHTML = `
  
    <p style="text-align: left; color: #6c757d; margin-bottom: 10px;">
      Nenhum prêmio cadastrado.
    </p>
    <button id="btnCriarPremio" class="btn btn-primary" style="display: block; margin: 0 auto; width: 180px;"> 
     <i class="fa-solid fa-plus"></i> Criar prêmio
    </button>
  
`;







      const btnCriarPremio = document.getElementById('btnCriarPremio');
      if (btnCriarPremio) {
        btnCriarPremio.addEventListener('click', () => {
          window.location.href = 'pagpremios.html'; // Adjust this URL if the prize creation page has a different path
        });
      }
      return;
    }

    premios.forEach(premio => {
      console.log('Premio:', premio);
      const div = document.createElement('div');
      div.classList.add('card', 'p-3', 'm-2');

      div.style.flex = '0 0 calc(33.333% - 1rem)';

      div.style.flex = '0 0 auto';
div.style.width = '200px';
div.style.margin = '10px auto';


      div.style.boxSizing = 'border-box';
      


      // Check if premio.emoji is an emoji (length 2 or less and no dot), else treat as image URL
      const isEmoji = premio.emoji && premio.emoji.length <= 2 && !premio.emoji.includes('.');

      let emojiHtml = '';
      if (isEmoji) {
        emojiHtml = `
  <div style="
    background: linear-gradient(to right,rgba(251, 145, 64, 0.71),rgba(248, 116, 107, 0.71));

    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    min-width: 110px;
    min-height: 100px;
    margin-bottom: 10px;
    user-select: none;
    width: fit-content;
    padding: 0 0.5rem;
    margin-left: auto;
    margin-right: auto;
  ">
    ${premio.emoji}
  </div>
`;

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
          <span class="badge badge-pontos">${premio.pontos_necessarios} pts</span>

          <button class="btn btn-sm btn-resgatar">Resgatar</button>


        </div>
      `;

      container.appendChild(div);

      // Após adicionar cada card de prêmio:
div.querySelector('.btn-resgatar').addEventListener('click', async () => {
  try {
    const filhosResponse = await fetch(`${API_BASE}/filhos`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    const filhos = await filhosResponse.json();

    if (!filhos.length) {
      return Swal.fire('Erro', 'Você ainda não cadastrou filhos.', 'error');
    }

    const { value: filhoSelecionadoId } = await Swal.fire({
      title: 'Escolha o filho para resgatar',
      input: 'select',
      inputOptions: filhos.reduce((acc, f) => {
        acc[f.id] = `${f.nome} (${f.pontos} pts)`;
        return acc;
      }, {}),
      inputPlaceholder: 'Selecione um filho',
      showCancelButton: true,
      confirmButtonText: 'Verificar pontos'
    });

    if (!filhoSelecionadoId) return;

    const filho = filhos.find(f => f.id == filhoSelecionadoId);
    if (filho.pontos < premio.pontos_necessarios) {
      return Swal.fire('Sem Pontos 😞', `${filho.nome} não tem pontos suficientes.`, 'warning');
    }

    const confirmar = await Swal.fire({
      title: 'Confirmar Resgate?',
      text: `Deseja realmente resgatar o prêmio "${premio.nome}" para ${filho.nome}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, resgatar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmar.isConfirmed) return;

    const resgatar = await fetch(`${API_BASE}/resgatar-premio`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filho_id: parseInt(filhoSelecionadoId),
        premio_id: premio.id
      })
    });

    const resData = await resgatar.json();
    if (!resgatar.ok) throw new Error(resData.error || 'Erro ao resgatar');

    await Swal.fire('Resgatado 🎉', resData.message, 'success');

    // Atualiza a lista
    carregarPremios();
    carregarResumoFilhos(); // Atualiza os pontos no painel
  } catch (err) {
    console.error(err);
    Swal.fire('Erro', err.message || 'Erro ao processar resgate.', 'error');
  }
});


    });
  } catch (error) {
    console.error('Erro ao carregar prêmios:', error);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Não foi possível carregar os prêmios. Tente novamente mais tarde.'
    });

    const totalPontos = filhos.reduce((acc, f) => acc + (f.pontos || 0), 0);

// Mostra no elemento do topo
const totalPontosDisponiveisElem = document.getElementById('totalPontos');
if (totalPontosDisponiveisElem) {
  totalPontosDisponiveisElem.textContent = totalPontos;
}

// Mostra também no box verde, se existir
const resumoTotalPontosElem = document.getElementById('resumoTotalPontos');
if (resumoTotalPontosElem) {
  resumoTotalPontosElem.textContent = (totalPontos > 0 ? '+' : '') + totalPontos;
}

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
        // div.className = 'p-3 mb-2 rounded shadow-sm d-flex flex-column align-items-start';
        div.className = 'p-3 rounded d-flex flex-column align-items-start';


        div.style.backgroundColor = atividade.pontuacao > 0 ? '#f0f8ff' : '#fff4e6';
        div.style.marginBottom = '0.8rem';
        
        div.style.color = atividade.pontuacao > 0 ? '#1976d2' : '#fb8c00'; // texto
        div.style.borderRadius = '0.5rem';
        div.style.padding = '1rem'; // teste com padding menor
        div.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.17)';
        
        ;

       div.innerHTML = `
  <div style="width: 100%; display: flex; justify-content: space-between; align-items: start;">
    <div class="atividade-info texto-atividade" style="color:rgba(50, 54, 58, 0.73);">
      <strong>${atividade.titulo}</strong>
    </div>
    <div style="
      display: inline-flex; 
      align-items: center; 
      gap: 0.3rem; 
      font-weight: 600; 
      border: 1.5px solid ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'};
      border-radius: 9999px;
      padding: 0.2rem 0.6rem;
      font-size: 0.85rem;
      color: ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'};
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
      </svg>
      <span style="font-size: 0.7rem; color: ${atividade.pontuacao > 0 ? '#0B3D91' : '#EA580C'};">
        ${atividade.pontuacao < 0 ? '-' : ''}${Math.abs(atividade.pontuacao)} pts
      </span>
    </div>
  </div>

  <div style="margin-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div style="display: flex; align-items: center; gap: 1.0rem; white-space: nowrap; color: #555;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3z"/>
        <path fill-rule="evenodd" d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
      </svg>
      <span>${atividade.nome_filho}</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 3.5a.5.5 0 0 1 .5.5v4l3 1.5a.5.5 0 0 1-.5.866L8 8.5V4a.5.5 0 0 1 .5-.5z"/>
        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1z"/>
      </svg>
      <span>${new Date(atividade.data_limite).toLocaleDateString()}</span>
    </div>

    <div>
       ${
    atividade.concluida
      ? '<button class="btn btn-secondary btn-sm" disabled>Concluído</button>'
      : `<button class="btn btn-sm btn-confirmar" 
           style="
             background: ${
               atividade.pontuacao > 0
                 ? 'linear-gradient(to right, #1565c0, #42a5f5)'
                 : 'linear-gradient(to right, #FB953A, #FBBC25)'
             };
             color: white; 
             border: none;
           " 
           data-id="${atividade.id}">
           Concluir
         </button>`
  }
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

document.addEventListener('DOMContentLoaded', async () => {
  await carregarResumoFilhos();
  await carregarAtividadesRecentes();
  await carregarPremios();

  // Inicializa variáveis e DOM do gráfico
  const btnCriarCard = document.getElementById("btnCriarCard");
  const pontuacaoModal = new bootstrap.Modal(document.getElementById("pontuacaoModal"));
  const selectFilhoModal = document.getElementById("selectFilhoModal");
  const atividadesConcluidasModal = document.getElementById("atividadesConcluidasModal");
  const atividadesPendentesModal = document.getElementById("atividadesPendentesModal");
  const totalPontosModal = document.getElementById("totalPontosModal");
  const ctxModal = document.getElementById("graficoPontosRelatorioModal")?.getContext("2d");
  const ctxDesempenhoModal = document.getElementById("graficoDesempenhoTempoModal")?.getContext("2d");
  const ctxMainPontos = document.getElementById("graficoPontosRelatorio")?.getContext("2d");
  const ctxMainColunas = document.getElementById("graficoLinha")?.getContext("2d");


  let filhos = [];
  let atividadesCounts = [];
  let atividades = [];

  let chartModal = null;
  let chartDesempenhoModal = null;
  let chartMainPontos = null;
  let chartMainColunas = null;

  function filtrarAtividadesPorFilho(idFilho) {
    if (idFilho === "all") return atividades;
    return atividades.filter(a => a.filho_id === parseInt(idFilho));
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

    if (chartModal) chartModal.destroy();

    chartModal = new Chart(ctxModal, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data, backgroundColor: backgroundColors }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  function atualizarGraficoMain() {
    
    if (!ctxMainPontos || !ctxMainColunas) return;

    const idFilhoSelecionado = selectFilhoModal ? selectFilhoModal.value : "all";
    const counts = getAtividadesCountByFilho(idFilhoSelecionado);
    const dataAtividades = [counts.totalConcluidas, counts.totalPendentes];

    if (chartMainPontos) chartMainPontos.destroy();
    chartMainPontos = new Chart(ctxMainPontos, {
      type: "doughnut",
      data: {
        labels: ["Concluídas", "Pendentes"],
        datasets: [{ data: dataAtividades, backgroundColor: ["#2196f3", "#fb913b"] }]
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: { legend: { position: "bottom" } }
      }

      
    });

    const atividadesFiltradas = filtrarAtividadesPorFilho(idFilhoSelecionado);
    const pontosPorData = {};
    atividadesFiltradas.forEach(a => {
      if (a.concluida) {
        const data = new Date(a.data_limite).toLocaleDateString();
        pontosPorData[data] = (pontosPorData[data] || 0) + a.pontuacao;
      }
    });

    
   // const datas = Object.keys(pontosPorData).sort((a, b) => new Date(a) - new Date(b));
    // const pontos = datas.map(d => pontosPorData[d]);
    const datas = ["01/06", "02/06", "03/06"]; // dados fake
    const pontos = [10, 5, 8];

    

    if (chartMainColunas) chartMainColunas.destroy();
    chartMainColunas = new Chart(ctxMainColunas, {
  type: "line",
  data: {
    labels: datas, // Ex: ["01/06", "02/06", ...]
    datasets: [{
      label: "Pontos por Dia",
      data: pontos, // Ex: [10, 5, 8, 12]
      fill: true,
      borderColor: "#0d6efd",
      backgroundColor: "rgba(13, 110, 253, 0.15)",
      tension: 0.3,
      pointBackgroundColor: "#0d6efd",
      pointBorderColor: "#fff",
      pointRadius: 4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      },
      x: {
        title: {
          display: true,
          text: "Data"
        }
      }
    }
  }
});

  }

  function popularSelectFilho() {
    if (!selectFilhoModal) return;
    selectFilhoModal.innerHTML = '<option value="all" selected>Todos</option>';
    filhos.forEach(filho => {
      const option = document.createElement("option");
      option.value = filho.id;
      option.textContent = filho.nome;
      selectFilhoModal.appendChild(option);
    });
  }

  function ajustarLarguraPremios() {
  const container = document.getElementById('prizesContainer');
  if (!container) return;

  const isMobile = window.innerWidth < 576;
  container.querySelectorAll('div').forEach(div => {
    if (isMobile) {
      div.style.flex = '1 1 100%';
      div.style.maxWidth = '100%';
    } else {
      div.style.flex = '1 1 calc(33.33% - 20px)';
      div.style.maxWidth = '250px';
    }
  });
}

function ajustarAtividadesLayout() {
  const atividadesList = document.getElementById('atividadesList');
  if (!atividadesList) return;

  atividadesList.querySelectorAll('div').forEach(div => {
    div.style.width = '100%';
    div.style.boxSizing = 'border-box';
    div.style.padding = '0.75rem 1rem';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  ajustarLarguraPremios();
  ajustarAtividadesLayout();
});

window.addEventListener('resize', () => {
  ajustarLarguraPremios();
  ajustarAtividadesLayout();
});


  async function fetchFilhos() {
    try {
      const response = await fetch(`${API_BASE}/filhos`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Erro ao buscar filhos");
      filhos = await response.json();
      popularSelectFilho();
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchAtividadesCounts() {
    try {
      const response = await fetch(`${API_BASE}/atividades/concluidas/count`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!response.ok) throw new Error("Erro ao buscar contagem de atividades");
      atividadesCounts = await response.json();
      atualizarResumo();
      atualizarGraficoMain();
    } catch (error) {
      console.error(error);
    }
  }

  if (selectFilhoModal) {
    selectFilhoModal.addEventListener("change", () => {
      atualizarResumo();
      atualizarGraficoMain();
    });
  }

  if (btnCriarCard) {
    btnCriarCard.addEventListener("click", () => {
      pontuacaoModal.show();
      fetchFilhos().then(() => fetchAtividadesCounts());
    });
  }

  // Ajuste de padding dos cards
  setTimeout(() => {
    const atividadeDivs = document.querySelectorAll('#atividadesList > div');
    atividadeDivs.forEach(div => {
      div.style.padding = '0.5rem 0.75rem';
      div.style.marginBottom = '0.25rem';
    });
  }, 1000);

  // Dispara gráficos principais ao abrir a página
  await fetchFilhos();
  await fetchAtividadesCounts();
});
