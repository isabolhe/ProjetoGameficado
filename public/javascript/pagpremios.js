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
  const emojiButtons = document.querySelectorAll('.emoji-btn');
  const emojiInput = document.getElementById('emojiPremio');

  // Define a URL base de forma dinâmica
  const baseURL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : `https://${window.location.hostname}`; // Usa o domínio atual na produção

  let selectionMode = false;
  let selectedPremios = new Set();

  let editMode = false;
  let premioParaEditar = null;

  async function fetchPremios() {
    try {
      const response = await fetch(`${baseURL}/api/premios`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      if (!response.ok) throw new Error('Erro ao buscar prêmios');

      const premios = await response.json();

      console.log('Premios fetched:', premios);

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
        premios.forEach((premio, index) => {
          const item = document.createElement('div');
          item.className = 'list-group-item d-flex justify-content-between align-items-center';
          item.dataset.premioId = premio.id;
          item.setAttribute('data-aos', 'fade-up');
          item.setAttribute('data-aos-delay', Math.min(index * 100, 500));

          let emojiHtml = premio.emoji ? `<span class="me-2" style="font-size: 1.5rem;">${premio.emoji}</span>` : '';

          let checkboxHtml = selectionMode ? `<input type="checkbox" class="select-premio-checkbox me-3" data-id="${premio.id}">` : '';
          let radioHtml = editMode ? `<input type="radio" name="select-premio-editar" class="select-premio-radio me-3" data-id="${premio.id}">` : '';

          item.innerHTML = `
            <div class="d-flex align-items-center">
              ${checkboxHtml}${radioHtml}
              <div>
                <h5>${emojiHtml}${premio.nome}</h5>
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
          document.querySelectorAll('.select-premio-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
              const id = e.target.dataset.id;
              e.target.checked ? selectedPremios.add(id) : selectedPremios.delete(id);
              btnExcluirPremios.disabled = selectedPremios.size === 0;
            });
          });
        }

        if (editMode) {
          document.querySelectorAll('.select-premio-radio').forEach(radio => {
            radio.addEventListener('change', (e) => {
              const id = e.target.dataset.id;
              premioParaEditar = premios.find(p => p.id == id);
              if (premioParaEditar) {
                document.getElementById('nomePremio').value = premioParaEditar.nome;
                document.getElementById('descricaoPremio').value = premioParaEditar.descricao;
                document.getElementById('pontosNecessarios').value = premioParaEditar.pontos_necessarios;
                document.getElementById('emojiPremio').value = premioParaEditar.emoji || '';
                highlightSelectedEmoji(premioParaEditar.emoji || '');
                document.getElementById('cadastrarPremioModalLabel').textContent = 'Editar Prêmio';
                btnSalvarPremio.textContent = 'Salvar Alterações';
                modal.show();
              }
            });
          });
        }

        AOS.refresh();
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao carregar prêmios.', 'error');
    }
  }

  function highlightSelectedEmoji(selectedEmoji) {
    emojiButtons.forEach(btn => {
      if (btn.dataset.emoji === selectedEmoji) {
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-light');
      } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-light');
      }
    });
  }

  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiInput.value = btn.dataset.emoji;
      highlightSelectedEmoji(btn.dataset.emoji);
    });
  });

  async function deleteSelectedPremios() {
    if (selectedPremios.size === 0) {
      return Swal.fire('Atenção', 'Nenhum prêmio selecionado para exclusão.', 'warning');
    }

    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Você deseja excluir os prêmios selecionados? Essa ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      for (const id of selectedPremios) {
        const response = await fetch(`${baseURL}/api/premios/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
        });
        if (!response.ok) throw new Error(`Erro ao excluir prêmio com ID ${id}`);
      }

      selectedPremios.clear();
      selectionMode = false;
      btnToggleSelecao.textContent = 'Selecionar para Excluir';
      await Swal.fire('Sucesso', 'Prêmios excluídos com sucesso!', 'success');
      fetchPremios();
    } catch (error) {
      console.error(error);
      Swal.fire('Erro', 'Erro ao excluir prêmios.', 'error');
    }
  }

  btnToggleSelecao.addEventListener('click', () => {
    selectionMode = !selectionMode;
    selectedPremios.clear();
    btnToggleSelecao.textContent = selectionMode ? 'Cancelar Seleção' : 'Selecionar para Excluir';
    btnExcluirPremios.style.display = selectionMode ? 'inline-block' : 'none';
    fetchPremios();
  });

  btnToggleEdicao.addEventListener('click', () => {
    editMode = !editMode;
    premioParaEditar = null;
    btnToggleEdicao.textContent = editMode ? 'Cancelar Edição' : 'Selecionar para Editar';
    document.getElementById('cadastrarPremioModalLabel').textContent = 'Cadastrar Novo Prêmio';
    btnSalvarPremio.textContent = 'Salvar Prêmio';
    fetchPremios();
  });

  btnSalvarPremio.addEventListener('click', async () => {
    if (form.checkValidity()) {
      const nomePremio = document.getElementById('nomePremio').value.trim();
      const descricaoPremio = document.getElementById('descricaoPremio').value.trim();
      const pontosNecessarios = parseInt(document.getElementById('pontosNecessarios').value.trim(), 10);
      const emojiPremio = document.getElementById('emojiPremio').value.trim();

      if (!emojiPremio) {
        return Swal.fire('Atenção', 'Por favor, selecione um emoji para o prêmio.', 'warning');
      }

      try {
        let response;
        if (editMode && premioParaEditar) {
          response = await fetch(`${baseURL}/api/premios/${premioParaEditar.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              nome: nomePremio,
              descricao: descricaoPremio,
              pontos_necessarios: pontosNecessarios,
              emoji: emojiPremio
            })
          });
        } else {
          response = await fetch(`${baseURL}/api/premios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
              nome: nomePremio,
              descricao: descricaoPremio,
              pontos_necessarios: pontosNecessarios,
              emoji: emojiPremio
            })
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar prêmio');
        }

        form.reset();
        emojiInput.value = '';
        modal.hide();

        if (editMode) {
          editMode = false;
          premioParaEditar = null;
          btnToggleEdicao.textContent = 'Selecionar para Editar';
        }

        await Swal.fire('Sucesso', 'Prêmio salvo com sucesso!', 'success');
        fetchPremios();
      } catch (error) {
        console.error(error);
        Swal.fire('Erro', 'Erro ao salvar prêmio: ' + error.message, 'error');
      }
    } else {
      form.reportValidity();
    }
  });

  btnExcluirPremios.addEventListener('click', deleteSelectedPremios);

  fetchPremios();
});
