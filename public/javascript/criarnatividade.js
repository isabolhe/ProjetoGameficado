document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const filhosSelect = document.getElementById('filhos');
  const form = document.querySelector('form');

  try {
    const response = await fetch('http://localhost:3000/filhos', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const filhos = await response.json();

    if (!Array.isArray(filhos) || filhos.length === 0) {
      alert('Você precisa cadastrar pelo menos um filho antes de criar uma atividade.');
      window.location.href = 'pagresponsavel.html';
      return;
    }

    // Populate filhos dropdown and enable it
    filhosSelect.innerHTML = '';
    filhos.forEach(filho => {
      const option = document.createElement('option');
      option.value = filho.id;
      option.textContent = filho.nome;
      filhosSelect.appendChild(option);
    });
    filhosSelect.disabled = false;

  } catch (error) {
    console.error('Erro ao verificar filhos:', error);
    alert('Erro ao verificar filhos. Tente novamente mais tarde.');
    window.location.href = 'pagresponsavel.html';
    return;
  }

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const descricao = document.getElementById('descricao').value.trim();
    const pontuacao = parseInt(document.getElementById('pontuacao').value, 10);
    const data_limite = document.getElementById('data').value;
    const filho_id = filhosSelect.value;

    if (!titulo || !descricao || isNaN(pontuacao) || !data_limite || !filho_id) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/atividades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ titulo, descricao, pontuacao, data_limite, filho_id })
      });

      if (response.ok) {
        alert('Atividade criada com sucesso!');
        form.reset();
        filhosSelect.selectedIndex = 0;
      } else {
        const errorData = await response.json();
        alert('Erro ao criar atividade: ' + (errorData.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao criar atividade:', error);
      alert('Erro ao criar atividade. Tente novamente mais tarde.');
    }
  });
}
);
