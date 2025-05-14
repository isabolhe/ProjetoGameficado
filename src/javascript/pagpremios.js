document.addEventListener('DOMContentLoaded', () => {
  const btnSalvarPremio = document.getElementById('btnSalvarPremio');
  const modalElement = document.getElementById('cadastrarPremioModal');
  const modal = new bootstrap.Modal(modalElement);
  const form = document.getElementById('formCadastrarPremio');
  const alertNenhumPremio = document.getElementById('alertNenhumPremio');
  const listaPremios = document.getElementById('listaPremios');

  const apiBaseUrl = 'http://localhost:3000';

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
      } else {
        alertNenhumPremio.style.display = 'none';
        listaPremios.style.display = 'block';
        listaPremios.innerHTML = '';
        premios.forEach(premio => {
          const item = document.createElement('div');
          item.className = 'list-group-item';
          item.innerHTML = `
            <h5>${premio.nome}</h5>
            <p>${premio.descricao}</p>
            <small>Pontos Necessários: ${premio.pontos_necessarios}</small>
          `;
          listaPremios.appendChild(item);
        });
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar prêmios.');
    }
  }

  // Initial fetch of prizes
  fetchPremios();

  btnSalvarPremio.addEventListener('click', async () => {
    if (form.checkValidity()) {
      const nomePremio = document.getElementById('nomePremio').value.trim();
      const descricaoPremio = document.getElementById('descricaoPremio').value.trim();
      const pontosNecessarios = parseInt(document.getElementById('pontosNecessarios').value.trim(), 10);

      try {
        const response = await fetch(`${apiBaseUrl}/api/premios`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming token stored in localStorage
          },
          body: JSON.stringify({
            nome: nomePremio,
            descricao: descricaoPremio,
            pontos_necessarios: pontosNecessarios
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao salvar prêmio');
        }

        // Clear form and close modal
        form.reset();
        modal.hide();

        // Refresh prize list
        fetchPremios();

        alert('Prêmio salvo com sucesso!');
      } catch (error) {
        console.error(error);
        alert('Erro ao salvar prêmio: ' + error.message);
      }
    } else {
      form.reportValidity();
    }
  });
});
