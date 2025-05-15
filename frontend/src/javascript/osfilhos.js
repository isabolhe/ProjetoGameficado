const API_BASE = 'http://localhost:3000';

// Função para carregar filhos
async function carregarFilhos() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/filhos`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const filhos = await response.json();

        const listaFilhos = document.getElementById('lista-filhos');
        const mensagemNenhum = document.querySelector('.alert.alert-info');

        listaFilhos.innerHTML = ''; // Limpa a lista antes de renderizar

        if (filhos.length === 0) {
            mensagemNenhum.style.display = 'block';
            return;
        }

        mensagemNenhum.style.display = 'none';

        const titulo = document.createElement('h5');
        titulo.className = 'mb-3';
        titulo.textContent = 'Filhos Cadastrados';
        listaFilhos.appendChild(titulo);

        filhos.forEach(filho => {
            const filhoDiv = document.createElement('div');
            filhoDiv.className = 'p-3 mb-2 bg-light border rounded';
            filhoDiv.innerHTML = `
                <strong>${filho.nome}</strong><br>
                <small>${filho.email}</small>
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-sm btn-warning mr-2" onclick="abrirModalEditarExcluir(${filho.id}, '${filho.nome}', '${filho.email}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="abrirModalEditarExcluir(${filho.id}, '${filho.nome}', '${filho.email}')">Excluir</button>
                </div>
            `;

            listaFilhos.appendChild(filhoDiv);
        });
    } catch (error) {
        console.error('Erro ao carregar filhos:', error);
        const listaFilhos = document.getElementById('lista-filhos');
        listaFilhos.innerHTML = '<div class="alert alert-danger">Erro ao carregar filhos.</div>';
        const mensagemNenhum = document.querySelector('.alert.alert-info');
        mensagemNenhum.style.display = 'none';
    }
}

// Função para abrir o modal de edição e exclusão
function abrirModalEditarExcluir(id, nome, email) {
    document.getElementById('nomeFilhoModal').value = nome;
    document.getElementById('emailFilhoModal').value = email;

    // Mostrar o modal
    $('#modalEditarExcluir').modal('show');

    // Definir as ações dos botões
    document.getElementById('btnEditarFilho').onclick = () => editarFilho(id);
    document.getElementById('btnExcluirFilho').onclick = () => excluirFilho(id);
}

// Função para editar um filho
function editarFilho(id) {
    const nome = document.getElementById('nomeFilhoModal').value;
    const email = document.getElementById('emailFilhoModal').value;

    if (nome && email) {
        const token = localStorage.getItem('token');
        // Incluindo o ID na URL da requisição PUT
        fetch(`${API_BASE}/editar-filho/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email })  // Não precisa enviar o ID no corpo, pois ele já está na URL
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Filho editado com sucesso!') {
                alert('Filho editado com sucesso!');
                carregarFilhos(); // Atualiza a lista após edição
            } else {
                alert('Erro ao editar o filho');
            }
        })
        .catch(error => {
            alert('Erro ao conectar com o servidor.');
            console.error(error);
        });
    }
}


// Função para excluir um filho
function excluirFilho(id) {
    const confirmacao = confirm("Você tem certeza que deseja excluir este filho?");
    if (confirmacao) {
        const token = localStorage.getItem('token');
        fetch(`${API_BASE}/excluir-filho/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Filho excluído com sucesso!') {
                alert('Filho excluído com sucesso!');
                carregarFilhos(); // Atualiza a lista após exclusão
            } else {
                alert('Erro ao excluir o filho');
            }
        })
        .catch(error => {
            alert('Erro ao conectar com o servidor.');
            console.error(error);
        });
    }
}

// Event listener para carregar filhos ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nomeFilho').value.trim();
        const email = document.getElementById('emailFilho').value.trim();

        if (!nome || !email) {
            alert('Preencha todos os campos.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/criar-filho`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome, email })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Filho cadastrado com sucesso!');
                form.reset();
                carregarFilhos(); // Atualiza a lista após cadastro
            } else {
                alert(`Erro: ${data.error}`);
            }
        } catch (error) {
            alert('Erro ao conectar com o servidor.');
            console.error(error);
        }
    });

    carregarFilhos(); // Carrega ao iniciar
});
