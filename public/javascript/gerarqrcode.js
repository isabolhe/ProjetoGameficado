document.addEventListener('DOMContentLoaded', function () {
  const btnAtividades = document.getElementById('btnQrAtividades');
  const qrAtividadesDiv = document.getElementById('qrcode-atividades');

  const btnPremios = document.getElementById('btnQrPremios');
  const qrPremiosDiv = document.getElementById('qrcode-premios');

  // Gera QR Code para Atividades
  btnAtividades.addEventListener('click', function () {
    gerarQRCode('validacaoatvview.html', qrAtividadesDiv);
  });

  // Gera QR Code para Prêmios
  btnPremios.addEventListener('click', function () {
    gerarQRCode('pagpremiosview.html', qrPremiosDiv);
  });

  function gerarQRCode(pagina, containerDiv) {
    fetch('/gerar-token-publico', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    })
    .then(res => res.json())
    .then(data => {
      const link = `https://projetogameficado-production.up.railway.app/${pagina}?token=${data.tokenPublico}`;
      containerDiv.innerHTML = ''; // Limpa QR anterior, se houver

      QRCode.toCanvas(link, { width: 200 }, function (error, canvas) {
        if (error) {
          console.error('Erro ao gerar QR Code:', error);
        } else {
          containerDiv.appendChild(canvas);
        }
      });
    })
    .catch(err => console.error('Erro ao gerar token público:', err));
  }
});
