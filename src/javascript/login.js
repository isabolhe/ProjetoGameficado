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
            // Notificação de sucesso
            Swal.fire({
                icon: 'success',
                title: 'Login bem-sucedido!',
                text: 'Você será redirecionado em instantes...',
                timer: 2000,
                showConfirmButton: false
            });

            // Armazena o token
            if (dados.token) {
                localStorage.setItem('token', dados.token);
            }

            // Aguarda a animação e redireciona
            setTimeout(() => {
                window.location.href = 'pagresponsavel.html';
            }, 2000);
        } else {
            // Erro de login (ex: senha incorreta)
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: dados.mensagem || 'E-mail ou senha inválidos.'
            });
        }
    } catch (erro) {
        console.error('Erro ao fazer login:', erro);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Erro ao tentar fazer login. Tente novamente mais tarde.'
        });
    }
});
