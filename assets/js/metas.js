document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

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


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_metas";


    const MIGRACAO_KEY =
        "financasCasal_metas_migrado";


    let metas = [];

    let casalId = null;


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
        ).format(
            Number(numero) || 0
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
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                hoje.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${ano}-${mes}-${dia}`;

    }


    function formatarData(data) {

        if (!data) {

            return "—";

        }


        const partes =
            data.split("-");


        if (
            partes.length !== 3
        ) {

            return data;

        }


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    }


    function escaparHTML(valor) {

        return String(
            valor ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function mesesRestantes(
        dataAlvo
    ) {

        if (!dataAlvo) {

            return 1;

        }


        const hoje =
            new Date();


        const alvo =
            new Date(
                `${dataAlvo}T00:00:00`
            );


        if (
            Number.isNaN(
                alvo.getTime()
            )
        ) {

            return 1;

        }


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


    function iconeTipo(
        tipo
    ) {

        const icones = {

            Reserva:
                "🛟",

            Investimento:
                "💰",

            Viagem:
                "✈",

            Casa:
                "🏠",

            Compra:
                "🛍",

            Outro:
                "🎯"

        };


        return (
            icones[tipo] ||
            "🎯"
        );

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
        } = await supabaseClient
            .auth
            .getUser();


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
       CÁLCULOS
    ====================================================== */

    function percentualMeta(
        meta
    ) {

        const objetivo =
            Number(
                meta.objetivo
            ) || 0;


        if (
            objetivo <= 0
        ) {

            return 0;

        }


        return Math.min(
            100,
            (
                Number(
                    meta.atual
                ) /
                objetivo
            ) * 100
        );

    }


    function faltanteMeta(
        meta
    ) {

        return Math.max(
            0,
            (
                Number(
                    meta.objetivo
                ) || 0
            ) -
            (
                Number(
                    meta.atual
                ) || 0
            )
        );

    }


    function aporteNecessario(
        meta
    ) {

        const falta =
            faltanteMeta(
                meta
            );


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
       CARREGAR METAS DO SUPABASE
    ====================================================== */

    async function carregarMetasSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("metas")
            .select("*")
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar metas:",
                error
            );

            return false;

        }


        metas =
            (data || []).map(
                function (meta) {

                    return {

                        id:
                            meta.id,

                        casalId:
                            meta.casal_id,

                        legacyId:
                            meta.legacy_id,

                        nome:
                            meta.nome,

                        tipo:
                            meta.tipo,

                        responsavel:
                            meta.responsavel,

                        objetivo:
                            Number(
                                meta.objetivo
                            ) || 0,

                        atual:
                            Number(
                                meta.atual
                            ) || 0,

                        aporteMensal:
                            Number(
                                meta.aporte_mensal
                            ) || 0,

                        prazo:
                            meta.prazo,

                        descricao:
                            meta.descricao ||
                            "",

                        criadaEm:
                            meta.created_at

                    };

                }
            );


        console.log(
            `✅ ${metas.length} meta(s) carregada(s) do Supabase.`
        );


        return true;

    }


    /* =====================================================
       CARREGAR DADOS ANTIGOS
    ====================================================== */

    function carregarMetasLocais() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {

            return [];

        }


        try {

            const resultado =
                JSON.parse(
                    dados
                );


            if (
                !Array.isArray(
                    resultado
                )
            ) {

                return [];

            }


            return resultado;

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar metas locais:",
                erro
            );

            return [];

        }

    }


    /* =====================================================
       MIGRAÇÃO LOCALSTORAGE → SUPABASE
    ====================================================== */

    async function migrarMetas() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (
            jaMigrado === "true"
        ) {

            return;

        }


        const metasLocais =
            carregarMetasLocais();


        if (
            metasLocais.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        /* -----------------------------------------------
           VERIFICAR SE JÁ EXISTEM METAS NO BANCO
        ------------------------------------------------ */

        const {
            count,
            error
        } = await supabaseClient
            .from("metas")
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


        if (error) {

            console.error(
                "❌ Erro ao verificar metas existentes:",
                error
            );

            return;

        }


        /*
           Se já existem metas no banco,
           não duplicamos os dados antigos.
        */

        if (
            Number(count) > 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ Já existem metas no Supabase. Migração automática não executada."
            );

            return;

        }


        console.log(
            "📦 Migrando metas antigas para o Supabase..."
        );


        const metasParaInserir =
            metasLocais
                .filter(
                    function (meta) {

                        return (
                            meta.nome &&
                            Number(
                                meta.objetivo
                            ) > 0
                        );

                    }
                )
                .map(
                    function (meta) {

                        return {

                            casal_id:
                                casalId,

                            legacy_id:
                                String(
                                    meta.id ||
                                    ""
                                ),

                            nome:
                                String(
                                    meta.nome ||
                                    ""
                                ).trim(),

                            tipo:
                                meta.tipo ||
                                "Outro",

                            responsavel:
                                meta.responsavel ||
                                "Casal",

                            objetivo:
                                Number(
                                    meta.objetivo
                                ) || 0,

                            atual:
                                Number(
                                    meta.atual
                                ) || 0,

                            aporte_mensal:
                                Number(
                                    meta.aporteMensal
                                ) || 0,

                            prazo:
                                meta.prazo ||
                                null,

                            descricao:
                                String(
                                    meta.descricao ||
                                    ""
                                ).trim()

                        };

                    }
                );


        if (
            metasParaInserir.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        const {
            error:
                erroInsercao
        } = await supabaseClient
            .from("metas")
            .insert(
                metasParaInserir
            );


        if (
            erroInsercao
        ) {

            console.error(
                "❌ Erro durante a migração das metas:",
                erroInsercao
            );

            return;

        }


        localStorage.setItem(
            MIGRACAO_KEY,
            "true"
        );


        console.log(
            `✅ ${metasParaInserir.length} meta(s) migrada(s) para o Supabase.`
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
                        Number(
                            meta.atual
                        ) <
                        Number(
                            meta.objetivo
                        )
                    );

                }
            );


        const objetivos =
            metas.reduce(
                function (
                    soma,
                    meta
                ) {

                    return (
                        soma +
                        Number(
                            meta.objetivo
                        )
                    );

                },
                0
            );


        const atual =
            metas.reduce(
                function (
                    soma,
                    meta
                ) {

                    return (
                        soma +
                        Math.min(
                            Number(
                                meta.atual
                            ),
                            Number(
                                meta.objetivo
                            )
                        )
                    );

                },
                0
            );


        const faltante =
            metas.reduce(
                function (
                    soma,
                    meta
                ) {

                    return (
                        soma +
                        faltanteMeta(
                            meta
                        )
                    );

                },
                0
            );


        metasAtivas.textContent =
            ativas.length;


        totalObjetivos.textContent =
            moeda(
                objetivos
            );


        totalAtual.textContent =
            moeda(
                atual
            );


        totalFaltante.textContent =
            moeda(
                faltante
            );

    }


    /* =====================================================
       RENDERIZAR METAS
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
                    percentualMeta(
                        meta
                    );


                const falta =
                    faltanteMeta(
                        meta
                    );


                const aporte =
                    aporteNecessario(
                        meta
                    );


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
                                ${iconeTipo(
                                    meta.tipo
                                )}
                            </div>

                            <div>

                                <span class="goal-type">

                                    ${escaparHTML(
                                        meta.tipo
                                    )}
                                    •
                                    ${escaparHTML(
                                        meta.responsavel
                                    )}

                                </span>

                                <h3 class="goal-title">

                                    ${escaparHTML(
                                        meta.nome
                                    )}

                                </h3>

                            </div>

                        </div>


                        <button
                            class="goal-delete"
                            data-id="${escaparHTML(
                                meta.id
                            )}"
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
                                ${moeda(
                                    meta.atual
                                )}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Objetivo
                            </span>

                            <strong>
                                ${moeda(
                                    meta.objetivo
                                )}
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
                                ${percentual.toFixed(
                                    1
                                )}% concluído
                            </span>

                            <strong>
                                ${moeda(
                                    falta
                                )} faltante
                            </strong>

                        </div>

                    </div>


                    <div class="goal-meta-details">

                        <div class="goal-detail">

                            <span>
                                Aporte planejado
                            </span>

                            <strong>
                                ${moeda(
                                    meta.aporteMensal
                                )}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Necessário / mês
                            </span>

                            <strong>
                                ${moeda(
                                    aporte
                                )}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Prazo
                            </span>

                            <strong>
                                ${formatarData(
                                    meta.prazo
                                )}
                            </strong>

                        </div>


                        <div class="goal-detail">

                            <span>
                                Tempo restante
                            </span>

                            <strong>
                                ${
                                    concluida
                                        ? "Concluída"
                                        : `${meses} mês(es)`
                                }
                            </strong>

                        </div>

                    </div>


                    ${
                        meta.descricao
                            ? `
                                <p class="goal-description">

                                    ${escaparHTML(
                                        meta.descricao
                                    )}

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
        async function (evento) {

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
                !nomeMeta.value.trim()
            ) {

                alert(
                    "Informe o nome da meta."
                );

                return;

            }


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


            if (
                !prazoMeta.value
            ) {

                alert(
                    "Informe o prazo da meta."
                );

                return;

            }


            const novaMeta = {

                casal_id:
                    casalId,

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

                aporte_mensal:
                    aporte,

                prazo:
                    prazoMeta.value,

                descricao:
                    descricaoMeta.value.trim()

            };


            const botao =
                metaForm.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Salvando...";

            }


            const {
                data: metaInserida,
                error
            } = await supabaseClient
                .from("metas")
                .insert(
                    novaMeta
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar meta:",
                    error
                );


                alert(
                    "Não foi possível salvar a meta."
                );


                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar";

                }


                return;

            }


            metas.push({

                id:
                    metaInserida.id,

                casalId:
                    metaInserida.casal_id,

                legacyId:
                    metaInserida.legacy_id,

                nome:
                    metaInserida.nome,

                tipo:
                    metaInserida.tipo,

                responsavel:
                    metaInserida.responsavel,

                objetivo:
                    Number(
                        metaInserida.objetivo
                    ) || 0,

                atual:
                    Number(
                        metaInserida.atual
                    ) || 0,

                aporteMensal:
                    Number(
                        metaInserida.aporte_mensal
                    ) || 0,

                prazo:
                    metaInserida.prazo,

                descricao:
                    metaInserida.descricao ||
                    "",

                criadaEm:
                    metaInserida.created_at

            });


            console.log(
                "✅ Meta salva no Supabase:",
                metaInserida
            );


            atualizarTela();


            metaForm.reset();


            valorAtual.value =
                0;


            aporteMensal.value =
                0;


            prazoMeta.min =
                dataAtual();


            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       EXCLUIR META
    ====================================================== */

    goalsGrid.addEventListener(
        "click",
        async function (evento) {

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


            botao.disabled =
                true;


            const {
                error
            } = await supabaseClient
                .from("metas")
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
                    "❌ Erro ao excluir meta:",
                    error
                );


                alert(
                    "Não foi possível excluir a meta."
                );


                botao.disabled =
                    false;

                return;

            }


            metas =
                metas.filter(
                    function (meta) {

                        return (
                            meta.id !==
                            id
                        );

                    }
                );


            atualizarTela();


            console.log(
                "✅ Meta excluída."
            );

        }
    );


    /* =====================================================
       NOVA META
    ====================================================== */

    scrollNovaMeta.addEventListener(
        "click",
        function () {

            const novaMeta =
                document.getElementById(
                    "novaMeta"
                );


            if (!novaMeta) {

                return;

            }


            novaMeta.scrollIntoView({
                behavior:
                    "smooth"
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

    await migrarMetas();


    /* =====================================================
       CARREGAR DO SUPABASE
    ====================================================== */

    const carregou =
        await carregarMetasSupabase();


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