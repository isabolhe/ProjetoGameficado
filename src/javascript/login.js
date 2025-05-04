document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo_usuario = document.getElementById('tipo_usuario').value;

    try {
        const resposta = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha, tipo_usuario })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('Login bem-sucedido!');

            // Store JWT token in localStorage
            if (dados.token) {
                localStorage.setItem('token', dados.token);
            }

            // Redireciona conforme o tipo de usuário
            if (tipo_usuario === 'responsavel') {
                window.location.href = 'pagresponsavel.html';
            } else {
                window.location.href = 'dashboard_filho.html';
            }
        } else {
            alert(dados.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        alert('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
});
