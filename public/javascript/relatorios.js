const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `https://${window.location.hostname}`;

async function carregarFilhos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/filhos`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const filhos = await response.json();

    const selectFilho = document.getElementById('filho');
    selectFilho.innerHTML = '<option disabled selected>Selecione um filho</option>';

    filhos.forEach(filho => {
      const option = document.createElement('option');
      option.value = filho.id;
      option.textContent = `${filho.emoji || ''} ${filho.nome}`;
      selectFilho.appendChild(option);
    });

  } catch (error) {
    console.error('Erro ao carregar filhos:', error);
  }
}

function exibirAnotacoes() {
  const anotacoes = JSON.parse(localStorage.getItem('anotacoes')) || [];

  const containers = [
    {
      lista: document.getElementById('listaAnotacoesDesktop'),
      vazio: document.getElementById('anotacaoVaziaDesktop')
    },
    {
      lista: document.getElementById('listaAnotacoesMobile'),
      vazio: document.getElementById('anotacaoVaziaMobile')
    }
  ];

  containers.forEach(({ lista, vazio }) => {
    if (!lista) return;

    // Remove anotações antigas
    [...lista.querySelectorAll('.card-anotacao')].forEach(card => card.remove());

    if (anotacoes.length === 0) {
      if (vazio) vazio.style.display = 'block';
    } else {
      if (vazio) vazio.style.display = 'none';

      anotacoes.forEach(anotacao => {
        const card = document.createElement('div');
        card.className = 'card-anotacao px-2 py-3 border-bottom';

        card.innerHTML = `
          <div class="d-flex flex-column">
            <strong class="titulo-toggle text-primary mb-1" style="cursor: pointer;">
              ${anotacao.titulo}
            </strong>
            <div class="anotacao-texto text-body-secondary mb-1" style="display: none;">
              <small>${anotacao.texto}</small>
            </div>
            <small class="text-muted">Filho: ${anotacao.filhoNome || anotacao.filho}</small>
          </div>
        `;

        const header = card.querySelector('.titulo-toggle');
        const texto = card.querySelector('.anotacao-texto');

        if (header && texto) {
          header.addEventListener('click', () => {
            const isVisible = texto.style.display === 'block';
            texto.style.display = isVisible ? 'none' : 'block';
          });
        }

        lista.appendChild(card);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  carregarFilhos();
  exibirAnotacoes();

  const form = document.getElementById('formAnotacao');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo').value.trim();
    const filhoSelect = document.getElementById('filho');
    const filhoId = filhoSelect.value;
    const filhoNome = filhoSelect.options[filhoSelect.selectedIndex].text;
    const texto = document.getElementById('texto').value.trim();

    if (!titulo || !filhoId || !texto) return;

    const anotacoes = JSON.parse(localStorage.getItem('anotacoes')) || [];
    anotacoes.unshift({ titulo, filhoId, filhoNome, texto });
    localStorage.setItem('anotacoes', JSON.stringify(anotacoes));

    form.reset();
    exibirAnotacoes();
  });
});
