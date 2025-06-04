// relatorios.js

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
        // Remove todas as anotações existentes (menos a mensagem vazia)
        [...lista.querySelectorAll('.card-anotacao')].forEach(card => card.remove());

        if (anotacoes.length === 0) {
            if (vazio) vazio.style.display = 'block';
        } else {
            if (vazio) vazio.style.display = 'none';

            anotacoes.forEach(anotacao => {
                const card = document.createElement('div');
                card.className = 'card-anotacao border rounded p-3 mb-3 bg-white shadow-sm';
                card.innerHTML = `
    <div class="d-flex flex-column">
        <div class="header-toggle" style="cursor: pointer;">
            <h6 class="mb-1">${anotacao.titulo}</h6>
            <small class="text-muted">Filho: ${anotacao.filhoNome || anotacao.filho}</small>
        </div>
        <div class="anotacao-texto mt-2" style="display: none;">
            <p class="mb-0">${anotacao.texto}</p>
        </div>
    </div>
`;

const header = card.querySelector('.header-toggle');
const texto = card.querySelector('.anotacao-texto');
header.addEventListener('click', () => {
    const isVisible = texto.style.display === 'block';
    texto.style.display = isVisible ? 'none' : 'block';
});


                lista.appendChild(card);
            });
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
  carregarFilhos();
  exibirAnotacoes();

  const form = document.getElementById('formAnotacao');
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
