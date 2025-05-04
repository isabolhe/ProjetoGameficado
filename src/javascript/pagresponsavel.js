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

    console.log('Filhos fetched:', filhos); // Debug log

    const divNenhum = document.getElementById('nenhumFilho');
    const divResumo = document.getElementById('filhosResumo');
    const btnCriarAtividade1 = document.querySelector('a[href="criarnatividade.html"]'); // botão no card
    const btnCriarAtividade2 = document.querySelector('.nav-link[href="criarnatividade.html"]'); // link da sidebar

    let temFilhos = Array.isArray(filhos) && filhos.length > 0;

    if (!temFilhos) {
      divNenhum.style.display = 'block';
      divResumo.classList.add('d-none');

      // Impede redirecionamento dos botões
      const bloquear = (e) => {
        e.preventDefault();
        const modal = new bootstrap.Modal(document.getElementById('modalSemFilhos'));
        modal.show();
      };

      btnCriarAtividade1?.addEventListener('click', bloquear);
      btnCriarAtividade2?.addEventListener('click', bloquear);
      return;
    }

    // Se tem filhos, exibe os dados
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

  } catch (error) {
    console.error('Erro ao carregar filhos:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  carregarResumoFilhos();
  carregarAtividadesRecentes();
  // Listen for activity confirmation event to update points summary and chart
  window.addEventListener('atividadeConfirmada', () => {
    carregarResumoFilhos();
    carregarAtividadesRecentes();
  });
});

let chart = null;

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

  atualizarGrafico(concluidas, pendentes);
}

function atualizarGrafico(concluidas, pendentes) {
  const ctx = document.getElementById("graficoPontos") ? document.getElementById("graficoPontos").getContext("2d") : null;
  if (!ctx) return;

  const labels = ["Concluídas", "Pendentes"];
  const data = [concluidas.length, pendentes.length];
  const backgroundColors = ["#4caf50", "#f44336"];

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

async function carregarAtividadesRecentes() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/filhos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const filhos = await response.json();

    const atividadesCard = document.querySelector('.col-md-6:nth-child(2) > .card.p-3 > div.text-center.py-5.text-muted');

    if (!filhos || filhos.length === 0) {
      atividadesCard.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade criada ainda.</div>';
      atualizarResumo([]);
      return;
    }

    const responseAtividades = await fetch('http://localhost:3000/atividades/recentes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const atividades = await responseAtividades.json();

    if (!atividades || atividades.length === 0) {
      atividadesCard.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade criada ainda.</div>';
      atualizarResumo([]);
      return;
    }

    atividadesCard.innerHTML = '';
    atividades.forEach(atividade => {
      const div = document.createElement('div');
      div.className = 'p-3 mb-2 rounded shadow-sm d-flex justify-content-between align-items-center';
      div.style.backgroundColor = atividade.pontuacao > 0 ? '#d4edda' : '#f8d7da'; // green or red background
      div.innerHTML = `
        <div>
          <strong>${atividade.titulo}</strong><br>
          <small>${atividade.nome_filho} - ${new Date(atividade.data_limite).toLocaleDateString()}</small>
        </div>
        <div>
          <span class="badge ${atividade.pontuacao > 0 ? 'bg-success' : 'bg-danger'}">${atividade.pontuacao > 0 ? '+' : ''}${atividade.pontuacao}</span>
          ${atividade.concluida ? '<button class="btn btn-secondary btn-sm ms-2" disabled>Confirmado</button>' : '<button class="btn btn-primary btn-sm ms-2 btn-confirmar" data-id="' + atividade.id + '">Confirmar</button>'}
        </div>
      `;
      atividadesCard.appendChild(div);
    });

    // Add event listeners for confirm buttons
    document.querySelectorAll('.btn-confirmar').forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.getAttribute('data-id');
        try {
          const confirmResponse = await fetch(`http://localhost:3000/atividades/${id}/confirmar`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (confirmResponse.ok) {
            alert('Atividade confirmada com sucesso!');
            carregarAtividadesRecentes();
            // Reload the page to update other views
            window.location.reload();
          } else {
            const errorData = await confirmResponse.json();
            alert('Erro ao confirmar atividade: ' + (errorData.error || 'Erro desconhecido'));
          }
        } catch (error) {
          console.error('Erro ao confirmar atividade:', error);
          alert('Erro ao confirmar atividade. Tente novamente mais tarde.');
        }
      });
    });

    atualizarResumo(atividades);

  } catch (error) {
    console.error('Erro ao carregar atividades recentes:', error);
  }
}

// Expose function to refresh children list
window.refreshFilhos = carregarResumoFilhos;
