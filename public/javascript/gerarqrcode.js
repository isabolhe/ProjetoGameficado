document.addEventListener('DOMContentLoaded', function() {
    const btnAtividades = document.querySelector('#qr-atividades + button');
    const qrAtividadesDiv = document.getElementById('qrcode-atividades');

    btnAtividades.addEventListener('click', function() {
        fetch('/gerar-token-publico', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(res => res.json())
        .then(data => {
            const linkAtividades = `https://projetogameficado-production.up.railway.app/validacaoatvview.html?token=${data.tokenPublico}`;
             /* mudar pra o link da pagina no site */

            qrAtividadesDiv.innerHTML = '';

            QRCode.toCanvas(linkAtividades, { width: 200 }, function (error, canvas) {
                if (error) console.error(error);
                qrAtividadesDiv.appendChild(canvas);
            });
        })
        .catch(err => console.error('Erro ao gerar token público:', err));
    });
});


document.addEventListener('DOMContentLoaded', function () {
  const btnAtividades = document.querySelector('#qr-atividades + button');
  const qrAtividadesDiv = document.getElementById('qrcode-atividades');

  btnAtividades.addEventListener('click', function () {
    gerarQRCode('validacaoatvview.html', qrAtividadesDiv);
  });

  // NOVO: botão e div para QR de prêmios
  const btnPremios = document.getElementById('btnQrPremios');
  const qrPremiosDiv = document.getElementById('qrcode-premios');

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

        containerDiv.innerHTML = ''; // Limpa QR anterior
        QRCode.toCanvas(link, { width: 200 }, function (error, canvas) {
          if (error) console.error(error);
          containerDiv.appendChild(canvas);
        });
      })
      .catch(err => console.error('Erro ao gerar token público:', err));
  }
});
