// URL base dinâmica
const baseURL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : `https://${window.location.hostname}`;

// Botão "Sair da Conta"
document.querySelector('.btn-outline-secondary.text-danger')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'login.html';
});

// Botão "Excluir Conta"
document.querySelector('.btn-danger.w-100')?.addEventListener('click', async () => {
  const { value: senha } = await Swal.fire({
    title: 'Confirme sua senha',
    input: 'password',
    inputLabel: 'Digite sua senha para excluir a conta',
    inputPlaceholder: 'Senha',
    inputAttributes: {
      maxlength: 50,
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Excluir Conta',
    confirmButtonColor: '#d33',
    cancelButtonText: 'Cancelar'
  });

  if (!senha) return;

  const token = localStorage.getItem('token');

  try {
    const resposta = await fetch(`${baseURL}/responsavel`, {

      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ senha })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.error || 'Erro ao excluir conta.');
    }

    await Swal.fire({
      icon: 'success',
      title: 'Conta excluída!',
      text: 'Sua conta foi removida com sucesso.',
      timer: 2000,
      showConfirmButton: false
    });

    localStorage.clear();
    window.location.href = 'login.html';

  } catch (erro) {
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: erro.message || 'Erro inesperado ao excluir conta.'
    });
  }
});
