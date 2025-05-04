document.addEventListener("DOMContentLoaded", () => {
    const atividadesContainer = document.getElementById("atividadesContainer");
    const lista = atividadesContainer ? atividadesContainer.querySelector(".list-group") : null;
    const semAtividade = document.querySelector(".alert-info");

    const filtroData = document.querySelector("input[type='date']");
    const filtroFilho = document.querySelectorAll("select")[0];
    const filtroStatus = document.querySelectorAll("select")[1];

    // Summary elements
    const resumoContainer = document.getElementById("resumoContainer");
    const totalPontosElem = document.getElementById("totalPontos");
    const atividadesConcluidasElem = document.getElementById("atividadesConcluidas");
    const atividadesPendentesElem = document.getElementById("atividadesPendentes");
    const ctx = document.getElementById("graficoPontos") ? document.getElementById("graficoPontos").getContext("2d") : null;

    let atividades = [];
    let filhos = [];

    // Chart instance
    let chart = null;

    // Fetch filhos from backend
    async function fetchFilhos() {
        try {
            const response = await fetch("http://localhost:3000/filhos", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (!response.ok) throw new Error("Erro ao buscar filhos");
            filhos = await response.json();
            preencherFilhos();
        } catch (error) {
            console.error(error);
        }
    }

    // Fetch atividades from backend
    async function fetchAtividades() {
        try {
            const response = await fetch("http://localhost:3000/atividades", {
                headers: { Authorization: "Bearer " + localStorage.getItem("token") }
            });
            if (!response.ok) throw new Error("Erro ao buscar atividades");
            atividades = await response.json();
            aplicarFiltros();
            atualizarResumo();
        } catch (error) {
            console.error(error);
        }
    }

    function preencherFilhos() {
        if (!filtroFilho) return;
        filtroFilho.innerHTML = '<option value="">Nenhum filho</option>';
        filhos.forEach(filho => {
            const option = document.createElement("option");
            option.value = filho.nome;
            option.textContent = filho.nome;
            filtroFilho.appendChild(option);
        });

        filtroFilho.disabled = false;
        filtroData.disabled = false;
        filtroStatus.disabled = false;
    }

    function renderizarAtividades(filtradas = atividades) {
        if (!lista) return;
        lista.innerHTML = "";

        if (filtradas.length === 0) {
            if (atividadesContainer) atividadesContainer.classList.add("d-none");
            if (semAtividade) semAtividade.classList.remove("d-none");
        } else {
            if (atividadesContainer) atividadesContainer.classList.remove("d-none");
            if (semAtividade) semAtividade.classList.add("d-none");

            filtradas.forEach(atividade => {
                const item = document.createElement("div");
                item.className = "list-group-item list-group-item-action flex-column align-items-start mb-3";
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">${atividade.titulo}</h5>
                        <small>${new Date(atividade.data_limite).toLocaleDateString()}</small>
                    </div>
                    <p class="mb-1">${atividade.descricao}</p>
                    <small>Status: ${atividade.concluida ? "Concluída" : "Pendente"} | Filho: ${atividade.nome_filho} | Pontos: ${atividade.pontuacao > 0 ? '+' : ''}${atividade.pontuacao}</small>
                `;
                lista.appendChild(item);
            });
        }
    }

    function aplicarFiltros() {
        let filtradas = [...atividades];

        const data = filtroData.value;
        const filho = filtroFilho.value;
        const status = filtroStatus.value;

        if (data) {
            filtradas = filtradas.filter(a => new Date(a.data_limite).toISOString().split("T")[0] === data);
        }

        if (filho) {
            filtradas = filtradas.filter(a => a.nome_filho === filho);
        }

        if (status) {
            if (status === "Concluída") {
                filtradas = filtradas.filter(a => a.concluida === true);
            } else if (status === "Pendente") {
                filtradas = filtradas.filter(a => a.concluida === false);
            }
        }

        renderizarAtividades(filtradas);
        atualizarResumo(filtradas);
    }

    function atualizarResumo(filtradas = atividades) {
        const concluidas = filtradas.filter(a => a.concluida === true);
        const pendentes = filtradas.filter(a => a.concluida === false);
        const totalPontos = concluidas.reduce((acc, a) => acc + a.pontuacao, 0);

        if (atividadesConcluidasElem) atividadesConcluidasElem.textContent = concluidas.length;
        if (atividadesPendentesElem) atividadesPendentesElem.textContent = pendentes.length;
        if (totalPontosElem) totalPontosElem.textContent = (totalPontos > 0 ? '+' : '') + totalPontos;

        atualizarGrafico(concluidas, pendentes);
    }

    function atualizarGrafico(concluidas, pendentes) {
        if (!ctx) return;
        const labels = ["Concluídas", "Pendentes"];
        const data = [concluidas.length, pendentes.length];
        const backgroundColors = ["#4caf50", "#f44336"];

        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });
    }

    if (filtroData) filtroData.addEventListener("change", aplicarFiltros);
    if (filtroFilho) filtroFilho.addEventListener("change", aplicarFiltros);
    if (filtroStatus) filtroStatus.addEventListener("change", aplicarFiltros);

    // Inicialização
    fetchFilhos().then(() => fetchAtividades());
});
