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
        const modal = new bootstrap.Modal(document.getElementById('modalSemFilhos'));
        modal.show();
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

  } catch (error) {
    console.error('Erro ao carregar filhos:', error);
  }
}

async function carregarPremios() {
  try {
    const token = localStorage.getItem('token');
    console.log('Fetching prizes with token:', token);
    const response = await fetch(`${API_BASE}/api/premios`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Erro ao buscar prêmios');
    }
    const premios = await response.json();
    console.log('Prizes fetched:', premios);

    const prizesContainer = document.getElementById('prizesContainer');
    prizesContainer.innerHTML = '';

    if (premios.length === 0) {
      prizesContainer.innerHTML = '<div class="text-muted">Nenhum prêmio cadastrado.</div>';
      return;
    }

    premios.forEach(premio => {
      const div = document.createElement('div');
      div.className = 'p-2 border rounded mb-2';
      div.innerHTML = `
        <strong>${premio.nome}</strong><br>
        <small>${premio.descricao}</small><br>
        <small><em>Pontos Necessários: ${premio.pontos_necessarios}</em></small>
      `;
      prizesContainer.appendChild(div);
    });
  } catch (error) {
    console.error('Erro ao carregar prêmios:', error);
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
        div.className = 'p-3 mb-2 rounded shadow-sm d-flex justify-content-between align-items-center';
        div.style.backgroundColor = atividade.pontuacao > 0 ? '#e3f2fd' : '#fff3e0'; // fundo bem claro
        div.style.border = '1px solid ' + (atividade.pontuacao > 0 ? '#64b5f6' : '#ffb74d'); // tom médio
        div.style.color = atividade.pontuacao > 0 ? '#1976d2' : '#fb8c00'; // texto com tom forte mas não gritante
        div.style.borderRadius = '0.5rem';
        div.style.padding = '0.75rem';
        div.style.marginBottom = '0.5rem';
        div.innerHTML = `
          <div class="atividade-info">
            <strong>${atividade.titulo}</strong><br>
            <small>${atividade.nome_filho} - ${new Date(atividade.data_limite).toLocaleDateString()}</small>
          </div>
          <div>
            <span class="badge" style="background-color: ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'}; color: white;">${atividade.pontuacao > 0 ? '+' : ''}${atividade.pontuacao}</span>
            ${atividade.concluida ? '<button class="btn btn-secondary btn-sm ms-2" disabled>Confirmado</button>' : `<button class="btn btn-sm ms-2 btn-confirmar" style="background-color: ${atividade.pontuacao > 0 ? '#1976d2' : '#fb913b'}; color: white; border: none;" data-id="${atividade.id}">Confirmar</button>`}
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
              alert('Atividade confirmada com sucesso!');
              carregarAtividadesRecentes();
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
    }

    atualizarResumo(atividades);

  } catch (error) {
    console.error('Erro ao carregar atividades recentes:', error);
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
});
