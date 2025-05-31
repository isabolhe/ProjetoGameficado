// Define a URL base de forma dinâmica
const baseURL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : `https://${window.location.hostname}`; // Usa o domínio atual na produção

async function carregarFilhos() {
    try {
        const token = localStorage.getItem('token');
        
        const responseFilhos = await fetch(`${baseURL}/filhos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const filhos = await responseFilhos.json();

        const responseAtividades = await fetch(`${baseURL}/atividades/concluidas/count`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const atividadesCounts = await responseAtividades.json();

        const listaFilhos = document.getElementById('lista-filhos');
        const mensagemNenhum = document.querySelector('.alert.alert-info');

        listaFilhos.innerHTML = '';

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
            const counts = atividadesCounts.find(ac => ac.filho_id === filho.id) || {
                total_concluidas: 0,
                total_pendentes: 0
            };

            const filhoDiv = document.createElement('div');
            filhoDiv.className = 'p-3 mb-2 bg-light border rounded';
            filhoDiv.setAttribute('data-aos', 'fade-up');

            filhoDiv.innerHTML = `
                <strong>${filho.emoji ? filho.emoji + ' ' : ''}${filho.nome}</strong><br>
                <small>${filho.email}</small><br>
                <small>Idade: ${filho.idade !== null && filho.idade !== undefined ? filho.idade : '-'}</small><br>
                <small>Pontos Totais: ${filho.pontos || 0}</small><br>
                <small>Atividades Concluídas: ${counts.total_concluidas}</small><br>
                <small>Atividades Pendentes: ${counts.total_pendentes}</small>
                <div class="d-flex justify-content-end mt-2">
                    <button class="btn btn-sm btn-warning me-2" onclick="abrirModalEditarExcluir(${filho.id}, '${filho.nome}', '${filho.email}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="excluirFilho(${filho.id})">Excluir</button>
                </div>
            `;

            listaFilhos.appendChild(filhoDiv);
        });

        AOS.refresh();

    } catch (error) {
        console.error('Erro ao carregar filhos:', error);
        const listaFilhos = document.getElementById('lista-filhos');
        listaFilhos.innerHTML = '<div class="alert alert-danger">Erro ao carregar filhos.</div>';
        document.querySelector('.alert.alert-info').style.display = 'none';
    }
}

function abrirModalEditarExcluir(id, nome, email) {
    document.getElementById('nomeFilhoModal').value = nome;
    document.getElementById('emailFilhoModal').value = email;

    $('#modalEditarExcluir').modal('show');

    document.getElementById('btnEditarFilho').onclick = () => editarFilho(id);
    document.getElementById('btnExcluirFilho').onclick = () => excluirFilho(id);
}

function editarFilho(id) {
    const nome = document.getElementById('nomeFilhoModal').value;
    const email = document.getElementById('emailFilhoModal').value;

    if (nome && email) {
        const token = localStorage.getItem('token');
        fetch(`${baseURL}/editar-filho/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Filho editado com sucesso!') {
                Swal.fire('Sucesso', 'Filho editado com sucesso!', 'success');
                carregarFilhos();
            } else {
                Swal.fire('Erro', 'Erro ao editar o filho.', 'error');
            }
        })
        .catch(error => {
            Swal.fire('Erro', 'Erro ao conectar com o servidor.', 'error');
            console.error(error);
        });
    }
}

function excluirFilho(id) {
    Swal.fire({
        title: 'Tem certeza?',
        text: 'Você deseja mesmo excluir este filho?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem('token');
            fetch(`${baseURL}/excluir-filho/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Filho excluído com sucesso!') {
                    Swal.fire('Excluído!', 'Filho excluído com sucesso.', 'success');
                    carregarFilhos();
                } else {
                    Swal.fire('Erro', 'Erro ao excluir o filho.', 'error');
                }
            })
            .catch(error => {
                Swal.fire('Erro', 'Erro ao conectar com o servidor.', 'error');
                console.error(error);
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nome = document.getElementById('nomeFilho').value.trim();
        const email = document.getElementById('emailFilho').value.trim();
        const emoji = document.getElementById('emojiFilho').value;
        const idadeValue = document.getElementById('idadeFilho').value;
        const idade = idadeValue ? parseInt(idadeValue, 10) : null;

        if (!nome || !email) {
            Swal.fire('Campos obrigatórios', 'Preencha todos os campos.', 'warning');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/criar-filho`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nome, email, emoji, idade })
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Sucesso', 'Filho cadastrado com sucesso!', 'success');
                form.reset();
                carregarFilhos();
            } else {
                Swal.fire('Erro', data.error || 'Erro ao cadastrar.', 'error');
            }
        } catch (error) {
            Swal.fire('Erro', 'Erro ao conectar com o servidor.', 'error');
            console.error(error);
        }
    });

    carregarFilhos();
});
