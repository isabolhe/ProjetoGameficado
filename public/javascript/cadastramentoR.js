document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const nomeCompleto = document.getElementById('nomeCompleto').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const telefone = document.getElementById('telefone').value;
    const nomeFilho = document.getElementById('nomeFilho').value;
    const idadeFilho = document.getElementById('idadeFilho').value;
    const instituicaoEnsino = document.getElementById('instituicaoEnsino').value;
  
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/cadastro-responsavel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto,
          email,
          senha,
          telefone,
          nomeFilho,
          idadeFilho,
          instituicaoEnsino
        })
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = '../public/login.html'; // redireciona para o login
      } else {
        alert('Erro: ' + result.mensagem);
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
  