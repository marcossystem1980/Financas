document.addEventListener("DOMContentLoaded", async function () {


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
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_contas";

    const MIGRACAO_KEY =
        "financasCasal_contas_migrado";


    let contas = [];

    let casalId = null;


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
        ).format(
            Number(numero) || 0
        );

    }


    function formatarData(dataTexto) {

        if (!dataTexto) {

            return "-";

        }


        const partes =
            dataTexto.split("-");


        if (partes.length !== 3) {

            return dataTexto;

        }


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


        return (
            meses[
                Number(numeroMes) - 1
            ] || ""
        );

    }


    function escaparHTML(valorTexto) {

        return String(
            valorTexto ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       DATA ATUAL
    ====================================================== */

    function dataAtual() {

        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                agora.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${ano}-${mes}-${dia}`;

    }


    /* =====================================================
       IDENTIFICAR USUÁRIO E CASAL
    ====================================================== */

    async function carregarCasal() {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (
            userError ||
            !user
        ) {

            console.error(
                "❌ Usuário não autenticado:",
                userError
            );

            window.location.href =
                "../login.html";

            return false;

        }


        console.log(
            "👤 Usuário:",
            user.email
        );


        const {
            data: membro,
            error: membroError
        } = await supabaseClient
            .from("membros")
            .select("casal_id")
            .eq(
                "id",
                user.id
            )
            .single();


        if (
            membroError ||
            !membro
        ) {

            console.error(
                "❌ Não foi possível localizar o casal:",
                membroError
            );

            return false;

        }


        casalId =
            membro.casal_id;


        console.log(
            "✅ Casal identificado:",
            casalId
        );


        return true;

    }


    /* =====================================================
       CARREGAR CONTAS DO SUPABASE
    ====================================================== */

    async function carregarContasSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("contas")
            .select("*")
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "vencimento",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar contas:",
                error
            );

            return false;

        }


        contas =
            data || [];


        console.log(
            `✅ ${contas.length} conta(s) carregada(s) do Supabase.`
        );


        return true;

    }


    /* =====================================================
       LOCALSTORAGE — DADOS ANTIGOS
    ====================================================== */

    function carregarContasLocais() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {

            return [];

        }


        try {

            const registros =
                JSON.parse(dados);


            if (
                !Array.isArray(registros)
            ) {

                return [];

            }


            return registros;

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar contas antigas:",
                erro
            );

            return [];

        }

    }


    /* =====================================================
       MIGRAÇÃO LOCALSTORAGE → SUPABASE
    ====================================================== */

    async function migrarContas() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (
            jaMigrado === "true"
        ) {

            return;

        }


        const locais =
            carregarContasLocais();


        if (
            locais.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        /*
           Verifica se já existem contas
           desse casal no Supabase.
        */

        const {
            count,
            error: countError
        } = await supabaseClient
            .from("contas")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "casal_id",
                casalId
            );


        if (countError) {

            console.error(
                "❌ Erro ao verificar contas existentes:",
                countError
            );

            return;

        }


        /*
           Se já houver dados no banco,
           evitamos duplicidade.
        */

        if (
            Number(count) > 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            console.log(
                "ℹ️ Já existem contas no Supabase. Migração não executada."
            );

            return;

        }


        console.log(
            "📦 Migrando contas antigas para o Supabase..."
        );


        const registrosParaInserir =
            locais
                .filter(function (conta) {

                    return (
                        conta.descricao &&
                        conta.valor &&
                        conta.vencimento
                    );

                })
                .map(function (conta) {

                    return {

                        casal_id:
                            casalId,

                        descricao:
                            String(
                                conta.descricao || ""
                            ).trim(),

                        valor:
                            Number(
                                conta.valor
                            ) || 0,

                        vencimento:
                            conta.vencimento,

                        categoria:
                            conta.categoria ||
                            "Outros",

                        /*
                           A tela usa "recorrente".
                           O banco usa "tipo".
                        */

                        tipo:
                            conta.tipo ||
                            conta.recorrente ||
                            "Única",

                        responsavel:
                            conta.responsavel ||
                            "Casal",

                        status:
                            conta.status ===
                            "Pago"
                                ? "Pago"
                                : "Pendente"

                    };

                });


        if (
            registrosParaInserir.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        const {
            error
        } = await supabaseClient
            .from("contas")
            .insert(
                registrosParaInserir
            );


        if (error) {

            console.error(
                "❌ Erro durante a migração das contas:",
                error
            );

            return;

        }


        localStorage.setItem(
            MIGRACAO_KEY,
            "true"
        );


        console.log(
            `✅ ${registrosParaInserir.length} conta(s) migrada(s) para o Supabase.`
        );

    }


    /* =====================================================
       STATUS
    ====================================================== */

    function determinarStatus(conta) {

        if (
            conta.status ===
            "Pago"
        ) {

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


        if (
            venc < hoje
        ) {

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

                return (
                    conta.vencimento &&
                    conta.vencimento.startsWith(
                        mes
                    )
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
                    Number(
                        conta.valor
                    ) || 0;


                total +=
                    valorConta;


                const statusAtual =
                    determinarStatus(
                        conta
                    );


                if (
                    statusAtual ===
                    "Pago"
                ) {

                    pagas +=
                        valorConta;

                } else {

                    pendentes +=
                        valorConta;

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
                            determinarStatus(
                                conta
                            ) !==
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


        if (
            proximas.length === 0
        ) {

            proximoVencimento.textContent =
                "—";

            return;

        }


        const proxima =
            proximas[0];


        const partes =
            proxima.vencimento
                .split("-");


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
            new Date(
                hoje
            );


        limite.setDate(
            limite.getDate() + 3
        );


        const proximas =
            registros.filter(
                function (conta) {

                    if (
                        determinarStatus(
                            conta
                        ) ===
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
                        determinarStatus(
                            conta
                        ) ===
                        "Vencida"
                    );

                }
            );


        if (
            vencidas.length > 0
        ) {

            const valorTotal =
                vencidas.reduce(
                    function (
                        soma,
                        conta
                    ) {

                        return (
                            soma +
                            Number(
                                conta.valor
                            )
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


        if (
            proximas.length > 0
        ) {

            const valorTotal =
                proximas.reduce(
                    function (
                        soma,
                        conta
                    ) {

                        return (
                            soma +
                            Number(
                                conta.valor
                            )
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
                            determinarStatus(
                                conta
                            ) !==
                            "Pago"
                        );

                    }
                )
                .slice(
                    0,
                    5
                );


        upcomingList.innerHTML =
            "";


        if (
            proximas.length === 0
        ) {

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
                    conta.vencimento
                        .split("-");


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "upcoming-item";


                elemento.innerHTML = `

                    <div class="upcoming-date">

                        <strong>
                            ${escaparHTML(partes[2])}
                        </strong>

                        <span>
                            ${escaparHTML(
                                nomeMes(partes[1])
                            )}
                        </span>

                    </div>


                    <div class="upcoming-info">

                        <strong>
                            ${escaparHTML(
                                conta.descricao
                            )}
                        </strong>

                        <span>
                            ${escaparHTML(
                                conta.categoria
                            )}
                        </span>

                    </div>


                    <strong class="upcoming-value">
                        ${moeda(
                            Number(
                                conta.valor
                            )
                        )}
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
            status ===
            "Pago"
        ) {

            return `
                <span class="badge badge-paid">
                    Pago
                </span>
            `;

        }


        if (
            status ===
            "Vencida"
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
            tipo ===
            "Mensal"
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


        if (
            registros.length === 0
        ) {

            emptyTable.style.display =
                "block";

            return;

        }


        emptyTable.style.display =
            "none";


        registros.forEach(
            function (conta) {

                const status =
                    determinarStatus(
                        conta
                    );


                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>
                        ${formatarData(
                            conta.vencimento
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(
                                conta.descricao
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(
                            conta.categoria
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            conta.responsavel
                        )}
                    </td>

                    <td>
                        ${badgeTipo(
                            conta.tipo ||
                            conta.recorrente
                        )}
                    </td>

                    <td>
                        ${badgeStatus(
                            status
                        )}
                    </td>

                    <td class="value-cell">
                        ${moeda(
                            Number(
                                conta.valor
                            )
                        )}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${escaparHTML(
                                conta.id
                            )}"
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
       ATUALIZAR TELA
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
        async function (evento) {

            evento.preventDefault();


            const novaConta = {

                casal_id:
                    casalId,

                descricao:
                    descricao.value.trim(),

                valor:
                    Number(
                        valor.value
                    ) || 0,

                vencimento:
                    vencimento.value,

                categoria:
                    categoria.value,

                tipo:
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
                !novaConta.tipo ||
                !novaConta.responsavel
            ) {

                alert(
                    "Preencha todos os campos obrigatórios."
                );

                return;

            }


            const botaoSubmit =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (botaoSubmit) {

                botaoSubmit.disabled =
                    true;

                botaoSubmit.textContent =
                    "Salvando...";

            }


            const {
                data: contaInserida,
                error
            } = await supabaseClient
                .from("contas")
                .insert(
                    novaConta
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar conta:",
                    error
                );


                alert(
                    "Não foi possível salvar a conta."
                );


                if (botaoSubmit) {

                    botaoSubmit.disabled =
                        false;

                    botaoSubmit.textContent =
                        "Adicionar";

                }


                return;

            }


            console.log(
                "✅ Conta salva no Supabase:",
                contaInserida
            );


            contas.push(
                contaInserida
            );


            atualizarTela();


            form.reset();


            vencimento.value =
                dataAtual();


            if (botaoSubmit) {

                botaoSubmit.disabled =
                    false;

                botaoSubmit.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       CLIQUES NA TABELA
    ====================================================== */

    listaContas.addEventListener(
        "click",
        async function (evento) {


            /* ---------------------------------------------
               PAGAR CONTA
            ---------------------------------------------- */

            const botaoStatus =
                evento.target.closest(
                    "[data-action='pagar']"
                );


            if (
                botaoStatus
            ) {

                const linha =
                    botaoStatus.closest(
                        "tr"
                    );


                if (!linha) {
                    return;
                }


                const botaoExcluir =
                    linha.querySelector(
                        ".delete-button"
                    );


                if (!botaoExcluir) {
                    return;
                }


                const id =
                    botaoExcluir.dataset.id;


                botaoStatus.disabled =
                    true;


                const {
                    error
                } = await supabaseClient
                    .from("contas")
                    .update({
                        status: "Pago",
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "casal_id",
                        casalId
                    );


                if (error) {

                    console.error(
                        "❌ Erro ao marcar conta como paga:",
                        error
                    );


                    alert(
                        "Não foi possível marcar a conta como paga."
                    );


                    botaoStatus.disabled =
                        false;

                    return;

                }


                contas =
                    contas.map(
                        function (conta) {

                            if (
                                conta.id ===
                                id
                            ) {

                                return {

                                    ...conta,

                                    status:
                                        "Pago"

                                };

                            }


                            return conta;

                        }
                    );


                atualizarTela();


                console.log(
                    "✅ Conta marcada como paga."
                );


                return;

            }


            /* ---------------------------------------------
               EXCLUIR CONTA
            ---------------------------------------------- */

            const botaoExcluir =
                evento.target.closest(
                    ".delete-button"
                );


            if (
                !botaoExcluir
            ) {

                return;

            }


            const id =
                botaoExcluir.dataset.id;


            const confirmar =
                confirm(
                    "Deseja excluir esta conta?"
                );


            if (
                !confirmar
            ) {

                return;

            }


            botaoExcluir.disabled =
                true;


            const {
                error
            } = await supabaseClient
                .from("contas")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "casal_id",
                    casalId
                );


            if (error) {

                console.error(
                    "❌ Erro ao excluir conta:",
                    error
                );


                alert(
                    "Não foi possível excluir a conta."
                );


                botaoExcluir.disabled =
                    false;

                return;

            }


            contas =
                contas.filter(
                    function (conta) {

                        return (
                            conta.id !==
                            id
                        );

                    }
                );


            atualizarTela();


            console.log(
                "✅ Conta excluída."
            );

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
       INICIALIZAÇÃO
    ====================================================== */

    vencimento.value =
        dataAtual();


    mesFiltro.value =
        dataAtual().slice(
            0,
            7
        );


    /* =====================================================
       IDENTIFICAR CASAL
    ====================================================== */

    const casalCarregado =
        await carregarCasal();


    if (
        !casalCarregado
    ) {

        return;

    }


    /* =====================================================
       MIGRAÇÃO
    ====================================================== */

    await migrarContas();


    /* =====================================================
       CARREGAR DO SUPABASE
    ====================================================== */

    const carregou =
        await carregarContasSupabase();


    if (
        !carregou
    ) {

        return;

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    atualizarTela();

});