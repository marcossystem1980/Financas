document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const form =
        document.getElementById("contaForm");

    const mesFiltro =
        document.getElementById("mesFiltro");

    const descricao =
        document.getElementById("descricao");

    const valor =
        document.getElementById("valor");

    const vencimento =
        document.getElementById("vencimento");

    const categoria =
        document.getElementById("categoria");

    const recorrente =
        document.getElementById("recorrente");

    const responsavel =
        document.getElementById("responsavel");


    const listaContas =
        document.getElementById("listaContas");

    const emptyTable =
        document.getElementById("emptyTable");


    const upcomingList =
        document.getElementById("upcomingList");


    const totalContas =
        document.getElementById("totalContas");

    const totalPagas =
        document.getElementById("totalPagas");

    const totalPendentes =
        document.getElementById("totalPendentes");

    const proximoVencimento =
        document.getElementById("proximoVencimento");

    const quantidadeContas =
        document.getElementById("quantidadeContas");


    const dueAlert =
        document.getElementById("dueAlert");

    const dueAlertTitle =
        document.getElementById("dueAlertTitle");

    const dueAlertText =
        document.getElementById("dueAlertText");


    /* =====================================================
       STORAGE
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_contas";


    let contas =
        carregarContas();


    /* =====================================================
       STORAGE
    ====================================================== */

    function carregarContas() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {
            return [];
        }


        try {

            return JSON.parse(dados);

        } catch (erro) {

            console.error(
                "Erro ao carregar contas:",
                erro
            );

            return [];

        }

    }


    function salvarContas() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(contas)
        );

    }


    /* =====================================================
       FORMATADORES
    ====================================================== */

    function moeda(numero) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(numero);

    }


    function formatarData(dataTexto) {

        const partes =
            dataTexto.split("-");


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    function nomeMes(numeroMes) {

        const meses = [

            "JAN",
            "FEV",
            "MAR",
            "ABR",
            "MAI",
            "JUN",
            "JUL",
            "AGO",
            "SET",
            "OUT",
            "NOV",
            "DEZ"

        ];


        return meses[
            Number(numeroMes) - 1
        ];

    }


    function criarId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
        );

    }


    /* =====================================================
       STATUS
    ====================================================== */

    function determinarStatus(conta) {

        if (conta.status === "Pago") {

            return "Pago";

        }


        const hoje =
            new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const venc =
            new Date(
                `${conta.vencimento}T00:00:00`
            );


        if (venc < hoje) {

            return "Vencida";

        }


        return "Pendente";

    }


    /* =====================================================
       CONTAS DO MÊS
    ====================================================== */

    function contasDoMes() {

        const mes =
            mesFiltro.value;


        return contas.filter(
            function (conta) {

                return conta.vencimento.startsWith(
                    mes
                );

            }
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const registros =
            contasDoMes();


        let total = 0;
        let pagas = 0;
        let pendentes = 0;


        registros.forEach(
            function (conta) {

                const valorConta =
                    Number(conta.valor);


                total += valorConta;


                const statusAtual =
                    determinarStatus(conta);


                if (
                    statusAtual === "Pago"
                ) {

                    pagas += valorConta;

                } else {

                    pendentes += valorConta;

                }

            }
        );


        totalContas.textContent =
            moeda(total);

        totalPagas.textContent =
            moeda(pagas);

        totalPendentes.textContent =
            moeda(pendentes);


        quantidadeContas.textContent =
            `${registros.length} ${
                registros.length === 1
                    ? "conta"
                    : "contas"
            }`;


        atualizarProximoVencimento(
            registros
        );

    }


    /* =====================================================
       PRÓXIMO VENCIMENTO
    ====================================================== */

    function atualizarProximoVencimento(
        registros
    ) {

        const hoje =
            new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const proximas =
            registros
                .filter(
                    function (conta) {

                        return (
                            determinarStatus(conta) !==
                            "Pago"
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${a.vencimento}T00:00:00`
                            ) -
                            new Date(
                                `${b.vencimento}T00:00:00`
                            )
                        );

                    }
                );


        if (proximas.length === 0) {

            proximoVencimento.textContent =
                "—";

            return;

        }


        const proxima =
            proximas[0];


        const partes =
            proxima.vencimento.split("-");


        proximoVencimento.textContent =
            `${partes[2]}/${partes[1]}`;

    }


    /* =====================================================
       ALERTA
    ====================================================== */

    function atualizarAlerta(
        registros
    ) {

        const hoje =
            new Date();

        hoje.setHours(
            0,
            0,
            0,
            0
        );


        const limite =
            new Date(hoje);

        limite.setDate(
            limite.getDate() + 3
        );


        const proximas =
            registros.filter(
                function (conta) {

                    if (
                        determinarStatus(conta) ===
                        "Pago"
                    ) {

                        return false;

                    }


                    const venc =
                        new Date(
                            `${conta.vencimento}T00:00:00`
                        );


                    return (
                        venc >= hoje &&
                        venc <= limite
                    );

                }
            );


        const vencidas =
            registros.filter(
                function (conta) {

                    return (
                        determinarStatus(conta) ===
                        "Vencida"
                    );

                }
            );


        if (vencidas.length > 0) {

            const valorTotal =
                vencidas.reduce(
                    function (soma, conta) {

                        return (
                            soma +
                            Number(conta.valor)
                        );

                    },
                    0
                );


            dueAlert.classList.add(
                "visible"
            );


            dueAlertTitle.textContent =
                `${vencidas.length} conta(s) vencida(s)`;


            dueAlertText.textContent =
                `Total em atraso: ${moeda(valorTotal)}.`;

            return;

        }


        if (proximas.length > 0) {

            const valorTotal =
                proximas.reduce(
                    function (soma, conta) {

                        return (
                            soma +
                            Number(conta.valor)
                        );

                    },
                    0
                );


            dueAlert.classList.add(
                "visible"
            );


            dueAlertTitle.textContent =
                `${proximas.length} conta(s) vencendo nos próximos 3 dias`;


            dueAlertText.textContent =
                `Total previsto: ${moeda(valorTotal)}.`;

            return;

        }


        dueAlert.classList.remove(
            "visible"
        );

    }


    /* =====================================================
       PRÓXIMOS VENCIMENTOS
    ====================================================== */

    function renderizarProximas() {

        const registros =
            contasDoMes()
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${a.vencimento}T00:00:00`
                            ) -
                            new Date(
                                `${b.vencimento}T00:00:00`
                            )
                        );

                    }
                );


        const proximas =
            registros
                .filter(
                    function (conta) {

                        return (
                            determinarStatus(conta) !==
                            "Pago"
                        );

                    }
                )
                .slice(0, 5);


        upcomingList.innerHTML =
            "";


        if (proximas.length === 0) {

            upcomingList.innerHTML = `

                <div class="empty-state">
                    Nenhuma conta pendente.
                </div>

            `;

            return;

        }


        proximas.forEach(
            function (conta) {

                const partes =
                    conta.vencimento.split("-");


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "upcoming-item";


                elemento.innerHTML = `

                    <div class="upcoming-date">

                        <strong>
                            ${partes[2]}
                        </strong>

                        <span>
                            ${nomeMes(partes[1])}
                        </span>

                    </div>


                    <div class="upcoming-info">

                        <strong>
                            ${conta.descricao}
                        </strong>

                        <span>
                            ${conta.categoria}
                        </span>

                    </div>


                    <strong class="upcoming-value">
                        ${moeda(Number(conta.valor))}
                    </strong>

                `;


                upcomingList.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       BADGES
    ====================================================== */

    function badgeStatus(status) {

        if (
            status === "Pago"
        ) {

            return `
                <span class="badge badge-paid">
                    Pago
                </span>
            `;

        }


        if (
            status === "Vencida"
        ) {

            return `
                <button
                    class="status-button badge badge-overdue"
                    data-action="pagar"
                >
                    Vencida
                </button>
            `;

        }


        return `
            <button
                class="status-button badge badge-pending"
                data-action="pagar"
            >
                Pendente
            </button>
        `;

    }


    function badgeTipo(tipo) {

        if (
            tipo === "Mensal"
        ) {

            return `
                <span class="badge badge-monthly">
                    Mensal
                </span>
            `;

        }


        return `
            <span class="badge badge-single">
                Única
            </span>
        `;

    }


    /* =====================================================
       TABELA
    ====================================================== */

    function renderizarTabela() {

        const registros =
            contasDoMes()
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${a.vencimento}T00:00:00`
                            ) -
                            new Date(
                                `${b.vencimento}T00:00:00`
                            )
                        );

                    }
                );


        listaContas.innerHTML =
            "";


        if (registros.length === 0) {

            emptyTable.style.display =
                "block";

            return;

        }


        emptyTable.style.display =
            "none";


        registros.forEach(
            function (conta) {

                const status =
                    determinarStatus(conta);


                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>
                        ${formatarData(conta.vencimento)}
                    </td>

                    <td>
                        <strong>
                            ${conta.descricao}
                        </strong>
                    </td>

                    <td>
                        ${conta.categoria}
                    </td>

                    <td>
                        ${conta.responsavel}
                    </td>

                    <td>
                        ${badgeTipo(conta.recorrente)}
                    </td>

                    <td>
                        ${badgeStatus(status)}
                    </td>

                    <td class="value-cell">
                        ${moeda(Number(conta.valor))}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${conta.id}"
                            title="Excluir conta"
                        >
                            ×
                        </button>

                    </td>

                `;


                listaContas.appendChild(
                    linha
                );

            }
        );

    }


    /* =====================================================
       ATUALIZAR
    ====================================================== */

    function atualizarTela() {

        atualizarResumo();

        atualizarAlerta(
            contasDoMes()
        );

        renderizarProximas();

        renderizarTabela();

    }


    /* =====================================================
       ADICIONAR CONTA
    ====================================================== */

    form.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const novaConta = {

                id: criarId(),

                descricao:
                    descricao.value.trim(),

                valor:
                    Number(valor.value),

                vencimento:
                    vencimento.value,

                categoria:
                    categoria.value,

                recorrente:
                    recorrente.value,

                responsavel:
                    responsavel.value,

                status:
                    "Pendente"

            };


            if (
                !novaConta.descricao ||
                !novaConta.valor ||
                !novaConta.vencimento ||
                !novaConta.categoria ||
                !novaConta.responsavel
            ) {

                alert(
                    "Preencha todos os campos obrigatórios."
                );

                return;

            }


            contas.push(
                novaConta
            );


            salvarContas();

            atualizarTela();


            form.reset();


            vencimento.value =
                dataAtual();

        }
    );


    /* =====================================================
       CLIQUES NA TABELA
    ====================================================== */

    listaContas.addEventListener(
        "click",
        function (evento) {


            const botaoStatus =
                evento.target.closest(
                    "[data-action='pagar']"
                );


            if (botaoStatus) {

                const linha =
                    botaoStatus.closest("tr");


                const botaoExcluir =
                    linha.querySelector(
                        ".delete-button"
                    );


                const id =
                    botaoExcluir.dataset.id;


                contas =
                    contas.map(
                        function (conta) {

                            if (
                                conta.id === id
                            ) {

                                conta.status =
                                    "Pago";

                            }


                            return conta;

                        }
                    );


                salvarContas();

                atualizarTela();

                return;

            }


            const botaoExcluir =
                evento.target.closest(
                    ".delete-button"
                );


            if (!botaoExcluir) {
                return;
            }


            const id =
                botaoExcluir.dataset.id;


            const confirmar =
                confirm(
                    "Deseja excluir esta conta?"
                );


            if (!confirmar) {
                return;
            }


            contas =
                contas.filter(
                    function (conta) {

                        return (
                            conta.id !== id
                        );

                    }
                );


            salvarContas();

            atualizarTela();

        }
    );


    /* =====================================================
       MÊS
    ====================================================== */

    mesFiltro.addEventListener(
        "change",
        atualizarTela
    );


    /* =====================================================
       DATA
    ====================================================== */

    function dataAtual() {

        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    vencimento.value =
        dataAtual();


    mesFiltro.value =
        dataAtual().slice(0, 7);


    atualizarTela();

});