document.addEventListener('DOMContentLoaded', () => {
  const btnSalvarPremio = document.getElementById('btnSalvarPremio');
  const btnExcluirPremios = document.getElementById('btnExcluirPremios');
  const btnToggleSelecao = document.getElementById('btnToggleSelecao');
  const btnToggleEdicao = document.getElementById('btnToggleEdicao');
  const modalElement = document.getElementById('cadastrarPremioModal');
  const modal = new bootstrap.Modal(modalElement);
  const form = document.getElementById('formCadastrarPremio');
  const alertNenhumPremio = document.getElementById('alertNenhumPremio');
  const listaPremios = document.getElementById('listaPremios');

  const apiBaseUrl = 'http://localhost:3000';

  let selectionMode = false;
  let selectedPremios = new Set();

  let editMode = false;
  let premioParaEditar = null;

  // Function to fetch and display prizes
  async function fetchPremios() {
    try {
      const response = await fetch(`${apiBaseUrl}/api/premios`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming token stored in localStorage
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar prêmios');
      }
      const premios = await response.json();
      if (premios.length === 0) {
        alertNenhumPremio.style.display = 'block';
        listaPremios.style.display = 'none';
        btnExcluirPremios.style.display = 'none';
        btnToggleSelecao.style.display = 'none';
        btnToggleEdicao.style.display = 'none';
      } else {
        alertNenhumPremio.style.display = 'none';
        listaPremios.style.display = 'block';
        btnExcluirPremios.style.display = selectionMode ? 'inline-block' : 'none';
        btnToggleSelecao.style.display = 'inline-block';
        btnToggleEdicao.style.display = 'inline-block';
        listaPremios.innerHTML = '';
        premios.forEach(premio => {
          const item = document.createElement('div');
          item.className = 'list-group-item d-flex justify-content-between align-items-center';
          item.dataset.premioId = premio.id; // Assuming premio has an id field

          let checkboxHtml = '';
          let radioHtml = '';
          if (selectionMode) {
            checkboxHtml = `<input type="checkbox" class="select-premio-checkbox me-3" data-id="${premio.id}">`;
          }
          if (editMode) {
            radioHtml = `<input type="radio" name="select-premio-editar" class="select-premio-radio me-3" data-id="${premio.id}">`;
          }

          item.innerHTML = `
            <div class="d-flex align-items-center">
              ${checkboxHtml}${radioHtml}
              <div>
                <h5>${premio.nome}</h5>
                <p>${premio.descricao}</p>
              </div>
            </div>
            <div class="points-container d-flex align-items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#f4b942" class="bi bi-star-fill me-2" viewBox="0 0 16 16">
                <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.32-.158-.888.283-.95l4.898-.696 2.184-4.327c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.63.282.95l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
              </svg>
              <span class="points-text">${premio.pontos_necessarios} pts</span>
            </div>
          `;
          listaPremios.appendChild(item);
        });

        if (selectionMode) {
          // Add event listeners to checkboxes
          document.querySelectorAll('.select-premio-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
              const id = e.target.dataset.id;
              if (e.target.checked) {
                selectedPremios.add(id);
              } else {
                selectedPremios.delete(id);
              }
              btnExcluirPremios.disabled = selectedPremios.size === 0;
            });
          });
          btnExcluirPremios.disabled = selectedPremios.size === 0;
        }

        if (editMode) {
          // Add event listeners to radio buttons
          document.querySelectorAll('.select-premio-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
              const id = e.target.dataset.id;
              premioParaEditar = null;
              if (e.target.checked) {
                premioParaEditar = premios.find(p => p.id == id);
                if (premioParaEditar) {
                  // Pre-fill modal form with prize data
                  document.getElementById('nomePremio').value = premioParaEditar.nome;
                  document.getElementById('descricaoPremio').value = premioParaEditar.descricao;
                  document.getElementById('pontosNecessarios').value = premioParaEditar.pontos_necessarios;
                  // Change modal title and button text
                  document.getElementById('cadastrarPremioModalLabel').textContent = 'Editar Prêmio';
                  btnSalvarPremio.textContent = 'Salvar Alterações';
                  // Show modal
                  modal.show();
                }
              }
            });
          });
        }
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar prêmios.');
      btnExcluirPremios.style.display = 'none';
      btnToggleSelecao.style.display = 'none';
      btnToggleEdicao.style.display = 'none';
    }
  }

  // Function to delete selected prizes
  async function deleteSelectedPremios() {
    if (selectedPremios.size === 0) {
      alert('Nenhum prêmio selecionado para exclusão.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir os prêmios selecionados? Esta ação não pode ser desfeita.')) {
      return;
    }
    try {
      // Assuming API supports deleting individual prizes by ID
      for (const id of selectedPremios) {
        const response = await fetch(`${apiBaseUrl}/api/premios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        if (!response.ok) {
          throw new Error(`Erro ao excluir prêmio com ID ${id}`);
        }
      }
      alert('Prêmios excluídos com sucesso!');
      selectedPremios.clear();
      selectionMode = false;
      btnToggleSelecao.textContent = 'Selecionar para Excluir';
      fetchPremios();
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir prêmios.');
    }
  }

  // Toggle selection mode
  btnToggleSelecao.addEventListener('click', () => {
    selectionMode = !selectionMode;
    selectedPremios.clear();
    btnToggleSelecao.textContent = selectionMode ? 'Cancelar Seleção' : 'Selecionar para Excluir';
    btnExcluirPremios.style.display = selectionMode ? 'inline-block' : 'none';
    fetchPremios();
  });

  // Toggle edit mode
  btnToggleEdicao.addEventListener('click', () => {
    editMode = !editMode;
    premioParaEditar = null;
    btnToggleEdicao.textContent = editMode ? 'Cancelar Edição' : 'Selecionar para Editar';
    // Reset modal title and button text in case modal was open
    document.getElementById('cadastrarPremioModalLabel').textContent = 'Cadastrar Novo Prêmio';
    btnSalvarPremio.textContent = 'Salvar Prêmio';
    fetchPremios();
  });

  btnSalvarPremio.addEventListener('click', async () => {
    if (form.checkValidity()) {
      const nomePremio = document.getElementById('nomePremio').value.trim();
      const descricaoPremio = document.getElementById('descricaoPremio').value.trim();
      const pontosNecessarios = parseInt(document.getElementById('pontosNecessarios').value.trim(), 10);

      try {
        let response;
        if (editMode && premioParaEditar) {
          // Update existing prize
          response = await fetch(`${apiBaseUrl}/api/premios/${premioParaEditar.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              nome: nomePremio,
              descricao: descricaoPremio,
              pontos_necessarios: pontosNecessarios
            })
          });
        } else {
          // Create new prize
          response = await fetch(`${apiBaseUrl}/api/premios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              nome: nomePremio,
              descricao: descricaoPremio,
              pontos_necessarios: pontosNecessarios
            })
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar prêmio');
        }

        // Clear form and close modal
        form.reset();
        modal.hide();

        // Reset edit mode if it was active
        if (editMode) {
          editMode = false;
          premioParaEditar = null;
          btnToggleEdicao.textContent = 'Selecionar para Editar';
        }

        // Refresh prize list
        fetchPremios();

        alert(editMode ? 'Prêmio atualizado com sucesso!' : 'Prêmio salvo com sucesso!');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar prêmio: ' + error.message);
      }
    } else {
      form.reportValidity();
    }
  });

  btnExcluirPremios.addEventListener('click', deleteSelectedPremios);

  // Initial fetch of prizes
  fetchPremios();
});
