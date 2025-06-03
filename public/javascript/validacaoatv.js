document.addEventListener('DOMContentLoaded', function () {
  carregarAtividades();
});

async function carregarAtividades() {
  try {
    const token = localStorage.getItem('token');

    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : `https://${window.location.hostname}`;

    const response = await fetch(`${baseURL}/atividades`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Erro ao buscar atividades');

    const atividades = await response.json();

    const pendentesContainer = document.querySelector('#atividades-pendentes');
    const concluidasContainer = document.querySelector('#atividades-concluidas');

    pendentesContainer.innerHTML = '';
    concluidasContainer.innerHTML = '';

    if (!atividades || atividades.length === 0) {
      pendentesContainer.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade disponível.</div>';
      return;
    }

    const rowPendentes = document.createElement('div');
    rowPendentes.className = 'row';

    const rowConcluidas = document.createElement('div');
    rowConcluidas.className = 'row';

    atividades.forEach(atividade => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 mb-4';

      const card = document.createElement('div');
      if (atividade.concluida) {
        card.className = 'card-atividade card-concluido';
      } else if (atividade.pontuacao < 0) {
        card.className = 'card-atividade card-pendente-negativa';
      } else {
        card.className = 'card-atividade card-pendente-positiva';
      }

      card.style.cursor = 'pointer';

      const texto = document.createElement('div');
      texto.className = 'texto-atividade';

      const icone = document.createElement('div');
      icone.className = 'icone';
      if (atividade.concluida) {
        icone.textContent = '✓';
      }

      const titulo = document.createElement('span');
      titulo.textContent = atividade.titulo;

      texto.appendChild(icone);
      texto.appendChild(titulo);

      const pontos = document.createElement('div');
      pontos.className = 'valor-ponto';
      pontos.textContent = (atividade.pontuacao > 0 ? '+' : '') + atividade.pontuacao;

      if (atividade.pontuacao < 0) {
        pontos.classList.add('negativo');
      }

      if (!atividade.concluida) {
        pontos.classList.add('bg-laranja');
      }

      card.appendChild(texto);
      card.appendChild(pontos);
      col.appendChild(card);

      const descricao = document.createElement('div');
      descricao.className = 'descricao-atividade';
      descricao.textContent = atividade.descricao || 'Sem descrição';
      col.appendChild(descricao);

      // Clique simples / duplo
      let clickTimeout = null;
      card.addEventListener('click', () => {
        if (clickTimeout) {
          clearTimeout(clickTimeout);
          clickTimeout = null;

          if (!atividade.concluida) {
            Swal.fire({
              title: 'Confirmar atividade?',
              text: `Você realizou a atividade "${atividade.titulo}"?`,
              icon: 'question',
              showCancelButton: true,
              confirmButtonText: 'Sim, confirmar',
              cancelButtonText: 'Cancelar'
            }).then(result => {
              if (result.isConfirmed) {
                fetch(`${baseURL}/atividades/${atividade.id}/confirmar`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                })
                  .then(resp => {
                    if (resp.ok) {
                      Swal.fire({
                        title: 'Confirmado!',
                        text: 'Atividade confirmada com sucesso!',
                        icon: 'success'
                      });
                      carregarAtividades();
                      window.dispatchEvent(new CustomEvent('atividadeConfirmada'));
                    } else {
                      resp.json().then(data => {
                        Swal.fire({
                          title: 'Erro',
                          text: data.error || 'Erro desconhecido',
                          icon: 'error'
                        });
                      });
                    }
                  })
                  .catch(err => {
                    console.error('Erro ao confirmar:', err);
                    Swal.fire({
                      title: 'Erro',
                      text: 'Erro ao confirmar atividade.',
                      icon: 'error'
                    });
                  });
              }
            });
          }

        } else {
          clickTimeout = setTimeout(() => {
            descricao.classList.toggle('ativa');
            clickTimeout = null;
          }, 300);
        }
      });

      if (atividade.concluida) {
        rowConcluidas.appendChild(col);
      } else {
        rowPendentes.appendChild(col);
      }
    });

    pendentesContainer.appendChild(rowPendentes);
    concluidasContainer.appendChild(rowConcluidas);

  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
    Swal.fire({
      title: 'Erro',
      text: 'Erro ao carregar atividades.',
      icon: 'error'
    });
  }
}
