document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_metas";


    const metaForm =
        document.getElementById("metaForm");


    const nomeMeta =
        document.getElementById("nomeMeta");

    const tipoMeta =
        document.getElementById("tipoMeta");

    const responsavelMeta =
        document.getElementById("responsavelMeta");

    const valorObjetivo =
        document.getElementById("valorObjetivo");

    const valorAtual =
        document.getElementById("valorAtual");

    const aporteMensal =
        document.getElementById("aporteMensal");

    const prazoMeta =
        document.getElementById("prazoMeta");

    const descricaoMeta =
        document.getElementById("descricaoMeta");


    const goalsGrid =
        document.getElementById("goalsGrid");


    const metasAtivas =
        document.getElementById("metasAtivas");

    const totalObjetivos =
        document.getElementById("totalObjetivos");

    const totalAtual =
        document.getElementById("totalAtual");

    const totalFaltante =
        document.getElementById("totalFaltante");


    const scrollNovaMeta =
        document.getElementById("scrollNovaMeta");


    let metas =
        carregarMetas();


    /* =====================================================
       STORAGE
    ====================================================== */

    function carregarMetas() {

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
                "Erro ao carregar metas:",
                erro
            );

            return [];

        }

    }


    function salvarMetas() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(metas)
        );

    }


    /* =====================================================
       AUXILIARES
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


    function criarId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
        );

    }


    function dataAtual() {

        const hoje =
            new Date();


        const ano =
            hoje.getFullYear();


        const mes =
            String(
                hoje.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                hoje.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    }


    function formatarData(data) {

        if (!data) {
            return "—";
        }


        const partes =
            data.split("-");


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    }


    function mesesRestantes(dataAlvo) {

        const hoje =
            new Date();


        const alvo =
            new Date(
                `${dataAlvo}T00:00:00`
            );


        const diferenca =
            (
                alvo.getFullYear() -
                hoje.getFullYear()
            ) * 12 +
            (
                alvo.getMonth() -
                hoje.getMonth()
            );


        return Math.max(
            1,
            diferenca
        );

    }


    function iconeTipo(tipo) {

        const icones = {

            Reserva: "🛟",

            Investimento: "💰",

            Viagem: "✈",

            Casa: "🏠",

            Compra: "🛍",

            Outro: "🎯"

        };


        return (
            icones[tipo] ||
            "🎯"
        );

    }


    /* =====================================================
       CÁLCULO
    ====================================================== */

    function percentualMeta(meta) {

        if (
            Number(meta.objetivo) <= 0
        ) {

            return 0;

        }


        return Math.min(
            100,
            (
                Number(meta.atual) /
                Number(meta.objetivo)
            ) * 100
        );

    }


    function faltanteMeta(meta) {

        return Math.max(
            0,
            Number(meta.objetivo) -
            Number(meta.atual)
        );

    }


    function aporteNecessario(meta) {

        const falta =
            faltanteMeta(meta);


        if (
            falta <= 0
        ) {

            return 0;

        }


        const meses =
            mesesRestantes(
                meta.prazo
            );


        return (
            falta /
            meses
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const ativas =
            metas.filter(
                function (meta) {

                    return (
                        Number(meta.atual) <
                        Number(meta.objetivo)
                    );

                }
            );


        const objetivos =
            metas.reduce(
                function (soma, meta) {

                    return (
                        soma +
                        Number(meta.objetivo)
                    );

                },
                0
            );


        const atual =
            metas.reduce(
                function (soma, meta) {

                    return (
                        soma +
                        Math.min(
                            Number(meta.atual),
                            Number(meta.objetivo)
                        )
                    );

                },
                0
            );


        const faltante =
            metas.reduce(
                function (soma, meta) {

                    return (
                        soma +
                        faltanteMeta(meta)
                    );

                },
                0
            );


        metasAtivas.textContent =
            ativas.length;


        totalObjetivos.textContent =
            moeda(objetivos);


        totalAtual.textContent =
            moeda(atual);


        totalFaltante.textContent =
            moeda(faltante);

    }


    /* =====================================================
       RENDERIZAR
    ====================================================== */

    function renderizarMetas() {

        goalsGrid.innerHTML =
            "";


        if (
            metas.length === 0
        ) {

            goalsGrid.innerHTML = `

                <div class="empty-goal-state">
                    Nenhuma meta cadastrada ainda.
                </div>

            `;

            return;

        }


        metas.forEach(
            function (meta) {

                const percentual =
                    percentualMeta(meta);


                const falta =
                    faltanteMeta(meta);


                const aporte =
                    aporteNecessario(meta);


                const concluida =
                    percentual >= 100;


                const meses =
                    mesesRestantes(
                        meta.prazo
                    );


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "goal-card";


                card.innerHTML = `

                    <div class="goal-card-top">

                        <div class="goal-title-area">

                            <div class="goal-icon">
                                ${iconeTipo(meta.tipo)}
                            </div>

                            <div>

                                <span class="goal-type">
                                    ${meta.tipo} • ${meta.responsavel}
                                </span>

                                <h3 class="goal-title">
                                    ${meta.nome}
                                </h3>

                            </div>

                        </div>


                        <button
                            class="goal-delete"
                            data-id="${meta.id}"
                            title="Excluir meta"
                        >
                            ×
                        </button>

                    </div>


                    <div class="goal-values">

                        <div>

                            <span>
                                Já temos
                            </span>

                            <strong>
                                ${moeda(meta.atual)}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Objetivo
                            </span>

                            <strong>
                                ${moeda(meta.objetivo)}
                            </strong>

                        </div>

                    </div>


                    <div class="goal-progress">

                        <div class="goal-progress-bar">

                            <span
                                style="width: ${percentual}%"
                            ></span>

                        </div>


                        <div class="goal-progress-info">

                            <span>
                                ${percentual.toFixed(1)}% concluído
                            </span>

                            <strong>
                                ${moeda(falta)} faltante
                            </strong>

                        </div>

                    </div>


                    <div class="goal-meta-details">

                        <div class="goal-detail">

                            <span>
                                Aporte planejado
                            </span>

                            <strong>
                                ${moeda(meta.aporteMensal)}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Necessário / mês
                            </span>

                            <strong>
                                ${moeda(aporte)}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Prazo
                            </span>

                            <strong>
                                ${formatarData(meta.prazo)}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Tempo restante
                            </span>

                            <strong>
                                ${concluida ? "Concluída" : `${meses} mês(es)`}
                            </strong>

                        </div>

                    </div>


                    ${
                        meta.descricao
                            ? `
                                <p class="goal-description">
                                    ${meta.descricao}
                                </p>
                            `
                            : ""
                    }


                    ${
                        concluida
                            ? `
                                <div class="goal-complete">
                                    ✓ Objetivo alcançado
                                </div>
                            `
                            : ""
                    }

                `;


                goalsGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       CRIAR META
    ====================================================== */

    metaForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const objetivo =
                Number(
                    valorObjetivo.value
                );


            const atual =
                Number(
                    valorAtual.value
                ) || 0;


            const aporte =
                Number(
                    aporteMensal.value
                ) || 0;


            if (
                objetivo <= 0
            ) {

                alert(
                    "Informe um valor de objetivo maior que zero."
                );

                return;

            }


            if (
                atual > objetivo
            ) {

                alert(
                    "O valor atual não pode ser maior que o objetivo."
                );

                return;

            }


            const novaMeta = {

                id:
                    criarId(),

                nome:
                    nomeMeta.value.trim(),

                tipo:
                    tipoMeta.value,

                responsavel:
                    responsavelMeta.value,

                objetivo:
                    objetivo,

                atual:
                    atual,

                aporteMensal:
                    aporte,

                prazo:
                    prazoMeta.value,

                descricao:
                    descricaoMeta.value.trim(),

                criadaEm:
                    dataAtual()

            };


            metas.push(
                novaMeta
            );


            salvarMetas();

            atualizarTela();


            metaForm.reset();


            valorAtual.value = 0;

            aporteMensal.value = 0;

        }
    );


    /* =====================================================
       EXCLUIR META
    ====================================================== */

    goalsGrid.addEventListener(
        "click",
        function (evento) {

            const botao =
                evento.target.closest(
                    ".goal-delete"
                );


            if (!botao) {
                return;

            }


            const id =
                botao.dataset.id;


            const confirmar =
                confirm(
                    "Deseja excluir esta meta?"
                );


            if (!confirmar) {
                return;
            }


            metas =
                metas.filter(
                    function (meta) {

                        return (
                            meta.id !== id
                        );

                    }
                );


            salvarMetas();

            atualizarTela();

        }
    );


    /* =====================================================
       NOVA META
    ====================================================== */

    scrollNovaMeta.addEventListener(
        "click",
        function () {

            document
                .getElementById("novaMeta")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


    /* =====================================================
       ATUALIZAR
    ====================================================== */

    function atualizarTela() {

        atualizarResumo();

        renderizarMetas();

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    prazoMeta.min =
        dataAtual();


    atualizarTela();

});