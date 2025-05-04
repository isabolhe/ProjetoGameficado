document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const nomeCompletoFilho = document.getElementById('nomeCompletoFilho').value;
    const emailFilho = document.getElementById('emailFilho').value;
    const senhaFilho = document.getElementById('senhaFilho').value;
    const confirmarSenhaFilho = document.getElementById('confirmarSenhaFilho').value;
    const dataNascimentoFilho = document.getElementById('dataNascimentoFilho').value;
    const emailResponsavel = document.getElementById('emailResponsavel').value;
  
    if (senhaFilho !== confirmarSenhaFilho) {
      alert('As senhas não coincidem!');
      return;
    }
  
    if (!dataNascimentoFilho || dataNascimentoFilho === '0000-00-00') {
      alert('Preencha a data de nascimento corretamente.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/criar-filho', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: nomeCompletoFilho,
          email: emailFilho
        })
        
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert('Cadastro realizado com sucesso!');
        window.location.href = 'pagresponsavel.html';
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com o servidor.');
    }
  });
