document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const tipo_usuario = "responsavel";

    // Define a URL base de forma dinâmica
    const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : `https://${window.location.hostname}`; // Usa o domínio atual na produção

    try {
        const resposta = await fetch(`${baseURL}/login`, {
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

            if (dados.dados && dados.dados.nome) {
                localStorage.setItem('nomeResponsavel', dados.dados.nome);
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
