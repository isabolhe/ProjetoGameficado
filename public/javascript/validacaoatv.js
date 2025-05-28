document.addEventListener('DOMContentLoaded', () => {
  carregarAtividades();
});

async function carregarAtividades() {
  try {
    const token = localStorage.getItem('token');

    // Define a URL base de forma dinâmica
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : `https://${window.location.hostname}`;// Usa domínio atual em produção

    // Faz a requisição para buscar atividades usando baseURL
    const response = await fetch(`${baseURL}/atividades`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar atividades');
    }

    const atividades = await response.json();

    const container = document.querySelector('.row.gy-3');
    container.innerHTML = '';

    if (!atividades || atividades.length === 0) {
      container.innerHTML = '<div class="text-center py-5 text-muted">Nenhuma atividade disponível.</div>';
      return;
    }

    atividades.forEach(atividade => {
      const col = document.createElement('div');
      col.className = 'col-md-6';

      const btn = document.createElement('button');
      btn.className = 'btn btn-atividade w-100 text-start p-3 shadow-sm ' + (atividade.pontuacao > 0 ? 'positiva' : 'negativa');
      btn.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <span>${atividade.titulo} (${atividade.pontuacao > 0 ? '+' : ''}${atividade.pontuacao})</span>
          <span class="badge ${atividade.pontuacao > 0 ? 'bg-success' : 'bg-danger'}">${atividade.pontuacao > 0 ? '+' : ''}${atividade.pontuacao}</span>
        </div>
      `;

      if (atividade.concluida) {
        btn.disabled = true;
        btn.textContent += ' - Confirmado';
      } else {
        let clickTimeout = null;
        btn.addEventListener('click', () => {
          if (clickTimeout !== null) {
            clearTimeout(clickTimeout);
            clickTimeout = null;
            // Double click detected
            if (confirm('Confirmar que a atividade "' + atividade.titulo + '" foi realizada?')) {
              fetch(`${baseURL}/atividades/${atividade.id}/confirmar`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
                .then(response => {
                  if (response.ok) {
                    alert('Atividade confirmada com sucesso!');
                    carregarAtividades();
                    // Dispatch custom event to notify other pages to update summaries
                    window.dispatchEvent(new CustomEvent('atividadeConfirmada'));
                  } else {
                    response.json().then(errorData => {
                      alert('Erro ao confirmar atividade: ' + (errorData.error || 'Erro desconhecido'));
                    });
                  }
                })
                .catch(error => {
                  console.error('Erro ao confirmar atividade:', error);
                  alert('Erro ao confirmar atividade. Tente novamente mais tarde.');
                });
            }
          } else {
            // Single click detected after delay
            clickTimeout = setTimeout(() => {
              // Toggle description panel below button
              let descPanel = btn.nextElementSibling;
              if (descPanel && descPanel.classList.contains('descricao-atividade')) {
                // Toggle visibility
                if (descPanel.style.display === 'none' || descPanel.style.display === '') {
                  descPanel.style.display = 'block';
                } else {
                  descPanel.style.display = 'none';
                }
              } else {
                // Create description panel
                descPanel = document.createElement('div');
                descPanel.className = 'descricao-atividade p-2 mt-1 border rounded bg-light';
                descPanel.textContent = atividade.descricao;
                btn.parentNode.insertBefore(descPanel, btn.nextSibling);
              }
              clickTimeout = null;
            }, 300);
          }
        });
      }

      col.appendChild(btn);
      container.appendChild(col);
    });

  } catch (error) {
    console.error('Erro ao carregar atividades:', error);
  }
}
