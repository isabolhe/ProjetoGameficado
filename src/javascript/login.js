document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo_usuario = "responsavel";

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

            // Redireciona para a página do responsável
            window.location.href = 'pagresponsavel.html';
        } else {
            alert(dados.mensagem);
        }
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        alert('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
});
