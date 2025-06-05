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
            const linkAtividades = `http://localhost:3000/validacaoatvview.html?token=${data.tokenPublico}`;
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
