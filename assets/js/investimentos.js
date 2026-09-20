document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const form =
        document.getElementById(
            "investimentoForm"
        );


    const valorAporte =
        document.getElementById(
            "valorAporte"
        );


    const dataAporte =
        document.getElementById(
            "dataAporte"
        );


    const tipoInvestimento =
        document.getElementById(
            "tipoInvestimento"
        );


    const responsavel =
        document.getElementById(
            "responsavelInvestimento"
        );


    const metaInvestimento =
        document.getElementById(
            "metaInvestimento"
        );


    const observacaoAporte =
        document.getElementById(
            "observacaoAporte"
        );


    const aportesMes =
        document.getElementById(
            "aportesMes"
        );


    const totalAportado =
        document.getElementById(
            "totalAportado"
        );


    const aporteMedio =
        document.getElementById(
            "aporteMedio"
        );


    const quantidadeAportes =
        document.getElementById(
            "quantidadeAportes"
        );


    const metaPrincipalNome =
        document.getElementById(
            "metaPrincipalNome"
        );


    const metaPrincipalDescricao =
        document.getElementById(
            "metaPrincipalDescricao"
        );


    const metaPrincipalPercentual =
        document.getElementById(
            "metaPrincipalPercentual"
        );


    const recentInvestments =
        document.getElementById(
            "recentInvestments"
        );


    const investmentHistory =
        document.getElementById(
            "investmentHistory"
        );


    const emptyHistory =
        document.getElementById(
            "emptyHistory"
        );


    const historicoCount =
        document.getElementById(
            "historicoCount"
        );


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const INVESTIMENTOS_KEY =
        "financasCasal_investimentos";


    const MIGRACAO_KEY =
        "financasCasal_investimentos_migrado";


    let metas = [];

    let investimentos = [];

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


    /* =====================================================
       LOCALSTORAGE
       SOMENTE PARA MIGRAÇÃO
    ====================================================== */

    function carregarLocal(chave) {

        const dados =
            localStorage.getItem(
                chave
            );


        if (!dados) {

            return [];

        }


        try {

            const resultado =
                JSON.parse(
                    dados
                );


            return Array.isArray(
                resultado
            )
                ? resultado
                : [];

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar dados locais:",
                erro
            );

            return [];

        }

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
       CARREGAR METAS DO SUPABASE
    ====================================================== */

    async function carregarMetasSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("metas")
            .select(
                `
                id,
                casal_id,
                legacy_id,
                nome,
                tipo,
                responsavel,
                objetivo,
                atual,
                aporte_mensal,
                prazo,
                descricao,
                created_at
                `
            )
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
            `✅ ${metas.length} meta(s) carregada(s).`
        );


        return true;

    }


    /* =====================================================
       CARREGAR INVESTIMENTOS DO SUPABASE
    ====================================================== */

    async function carregarInvestimentosSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("investimentos")
            .select("*")
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "data",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar investimentos:",
                error
            );

            return false;

        }


        investimentos =
            (data || []).map(
                function (item) {

                    return {

                        id:
                            item.id,

                        casalId:
                            item.casal_id,

                        metaId:
                            item.meta_id,

                        valor:
                            Number(
                                item.valor
                            ) || 0,

                        data:
                            item.data,

                        tipo:
                            item.tipo,

                        responsavel:
                            item.responsavel,

                        observacao:
                            item.observacao ||
                            ""

                    };

                }
            );


        console.log(
            `✅ ${investimentos.length} investimento(s) carregado(s).`
        );


        return true;

    }


    /* =====================================================
       MIGRAÇÃO DO LOCALSTORAGE
    ====================================================== */

    async function migrarInvestimentos() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (
            jaMigrado === "true"
        ) {

            return;

        }


        const investimentosLocais =
            carregarLocal(
                INVESTIMENTOS_KEY
            );


        if (
            investimentosLocais.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            console.log(
                "ℹ️ Nenhum investimento antigo encontrado para migrar."
            );

            return;

        }


        /* -------------------------------------------------
           VERIFICAR SE JÁ EXISTEM INVESTIMENTOS NO BANCO
        -------------------------------------------------- */

        const {
            count,
            error
        } = await supabaseClient
            .from("investimentos")
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
                "❌ Erro ao verificar investimentos existentes:",
                error
            );

            return;

        }


        if (
            Number(count) > 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ Já existem investimentos no Supabase. Migração automática não executada."
            );


            return;

        }


        console.log(
            "📦 Migrando investimentos antigos para o Supabase..."
        );


        /* -------------------------------------------------
           MAPA DAS METAS ANTIGAS
           
           ID antigo da meta
                  ↓
           legacy_id
                  ↓
           novo UUID da meta
        -------------------------------------------------- */

        const metasPorLegacyId =
            new Map();


        metas.forEach(
            function (meta) {

                if (
                    meta.legacyId
                ) {

                    metasPorLegacyId.set(
                        String(
                            meta.legacyId
                        ),
                        meta.id
                    );

                }

            }
        );


        const registros =
            investimentosLocais
                .filter(
                    function (item) {

                        return (
                            Number(
                                item.valor
                            ) > 0 &&
                            item.data &&
                            item.tipo
                        );

                    }
                )
                .map(
                    function (item) {

                        const metaIdAntiga =
                            item.metaId
                                ? String(
                                    item.metaId
                                )
                                : null;


                        const novoMetaId =
                            metaIdAntiga
                                ? (
                                    metasPorLegacyId.get(
                                        metaIdAntiga
                                    ) || null
                                )
                                : null;


                        return {

                            casal_id:
                                casalId,

                            meta_id:
                                novoMetaId,

                            valor:
                                Number(
                                    item.valor
                                ) || 0,

                            data:
                                item.data,

                            tipo:
                                item.tipo,

                            responsavel:
                                item.responsavel ||
                                "Casal",

                            observacao:
                                String(
                                    item.observacao ||
                                    ""
                                ).trim()

                        };

                    }
                );


        if (
            registros.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ Não existem registros válidos para migrar."
            );


            return;

        }


        const {
            error:
                erroInsercao
        } = await supabaseClient
            .from("investimentos")
            .insert(
                registros
            );


        if (
            erroInsercao
        ) {

            console.error(
                "❌ Erro durante a migração dos investimentos:",
                erroInsercao
            );

            return;

        }


        localStorage.setItem(
            MIGRACAO_KEY,
            "true"
        );


        console.log(
            `✅ ${registros.length} investimento(s) migrado(s) para o Supabase.`
        );

    }


    /* =====================================================
       SELECT DE METAS
    ====================================================== */

function preencherMetas() {

    metaInvestimento.innerHTML = `

        <option value="">
            Sem meta específica
        </option>

    `;


    const metasDisponiveis =
        metas;


    metasDisponiveis.forEach(
        function (meta) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                meta.id;


            option.textContent =
                meta.nome;


            metaInvestimento.appendChild(
                option
            );

        }
    );

}


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const mesAtual =
            dataAtual().slice(
                0,
                7
            );


        const aportesDoMes =
            investimentos.filter(
                function (item) {

                    return (
                        item.data &&
                        item.data.startsWith(
                            mesAtual
                        )
                    );

                }
            );


        const totalMes =
            aportesDoMes.reduce(
                function (
                    soma,
                    item
                ) {

                    return (
                        soma +
                        Number(
                            item.valor
                        )
                    );

                },
                0
            );


        const total =
            investimentos.reduce(
                function (
                    soma,
                    item
                ) {

                    return (
                        soma +
                        Number(
                            item.valor
                        )
                    );

                },
                0
            );


        const media =
            investimentos.length > 0
                ? total /
                  investimentos.length
                : 0;


        aportesMes.textContent =
            moeda(
                totalMes
            );


        totalAportado.textContent =
            moeda(
                total
            );


        aporteMedio.textContent =
            moeda(
                media
            );


        quantidadeAportes.textContent =
            investimentos.length;

    }


    /* =====================================================
       META PRINCIPAL
    ====================================================== */

    function atualizarMetaPrincipal() {

        const metasInvestimento =
            metas.filter(
                function (meta) {

                    return (
                        meta.tipo ===
                        "Investimento"
                    );

                }
            );


        if (
            metasInvestimento.length ===
            0
        ) {

            metaPrincipalNome.textContent =
                "Nenhuma meta de investimento";


            metaPrincipalDescricao.textContent =
                "Crie uma meta do tipo Investimento em Metas.";


            metaPrincipalPercentual.textContent =
                "0%";


            return;

        }


        const meta =
            metasInvestimento.find(
                function (item) {

                    return (
                        Number(
                            item.atual
                        ) <
                        Number(
                            item.objetivo
                        )
                    );

                }
            ) ||
            metasInvestimento[0];


        const percentual =
            Number(
                meta.objetivo
            ) > 0
                ? Math.min(
                    100,
                    (
                        Number(
                            meta.atual
                        ) /
                        Number(
                            meta.objetivo
                        )
                    ) * 100
                )
                : 0;


        metaPrincipalNome.textContent =
            meta.nome;


        metaPrincipalDescricao.textContent =
            `${moeda(meta.atual)} de ${moeda(meta.objetivo)}`;


        metaPrincipalPercentual.textContent =
            `${percentual.toFixed(1)}%`;

    }


    /* =====================================================
       RECENTES
    ====================================================== */

    function renderizarRecentes() {

        recentInvestments.innerHTML =
            "";


        const recentes =
            [...investimentos]
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${b.data}T00:00:00`
                            ) -
                            new Date(
                                `${a.data}T00:00:00`
                            )
                        );

                    }
                )
                .slice(
                    0,
                    5
                );


        if (
            recentes.length ===
            0
        ) {

            recentInvestments.innerHTML = `

                <div class="empty-investment-state">

                    Nenhum aporte registrado.

                </div>

            `;

            return;

        }


        recentes.forEach(
            function (item) {

                const meta =
                    metas.find(
                        function (metaItem) {

                            return (
                                metaItem.id ===
                                item.metaId
                            );

                        }
                    );


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "recent-item";


                elemento.innerHTML = `

                    <div class="recent-icon">
                        💰
                    </div>

                    <div class="recent-info">

                        <strong>
                            ${moeda(
                                item.valor
                            )}
                        </strong>

                        <span>

                            ${formatarData(
                                item.data
                            )}

                            ·

                            ${escaparHTML(
                                item.tipo
                            )}

                            ${
                                meta
                                    ? `
                                        ·
                                        ${escaparHTML(
                                            meta.nome
                                        )}
                                      `
                                    : ""
                            }

                        </span>

                    </div>

                    <strong class="recent-value">

                        ${escaparHTML(
                            item.responsavel
                        )}

                    </strong>

                `;


                recentInvestments.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       HISTÓRICO
    ====================================================== */

    function renderizarHistorico() {

        investmentHistory.innerHTML =
            "";


        const registros =
            [...investimentos]
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${b.data}T00:00:00`
                            ) -
                            new Date(
                                `${a.data}T00:00:00`
                            )
                        );

                    }
                );


        historicoCount.textContent =
            `${registros.length} ${
                registros.length === 1
                    ? "registro"
                    : "registros"
            }`;


        if (
            registros.length ===
            0
        ) {

            emptyHistory.style.display =
                "block";

            return;

        }


        emptyHistory.style.display =
            "none";


        registros.forEach(
            function (item) {

                const meta =
                    metas.find(
                        function (metaItem) {

                            return (
                                metaItem.id ===
                                item.metaId
                            );

                        }
                    );


                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>

                        ${formatarData(
                            item.data
                        )}

                    </td>

                    <td class="value-cell">

                        ${moeda(
                            item.valor
                        )}

                    </td>

                    <td>

                        ${escaparHTML(
                            item.tipo
                        )}

                    </td>

                    <td>

                        ${escaparHTML(
                            item.responsavel
                        )}

                    </td>

                    <td>

                        ${
                            meta
                                ? escaparHTML(
                                    meta.nome
                                )
                                : "—"
                        }

                    </td>

                    <td>

                        ${
                            item.observacao
                                ? escaparHTML(
                                    item.observacao
                                )
                                : "—"
                        }

                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${escaparHTML(
                                item.id
                            )}"
                            title="Excluir aporte"
                        >
                            ×
                        </button>

                    </td>

                `;


                investmentHistory.appendChild(
                    linha
                );

            }
        );

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    function atualizarTela() {

        preencherMetas();

        atualizarResumo();

        atualizarMetaPrincipal();

        renderizarRecentes();

        renderizarHistorico();

    }


    /* =====================================================
       NOVO APORTE
    ====================================================== */

    form.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const valor =
                Number(
                    valorAporte.value
                );


            if (
                !valor ||
                valor <= 0
            ) {

                alert(
                    "Informe um valor de aporte válido."
                );

                return;

            }


            const data =
                dataAporte.value;


            const tipo =
                tipoInvestimento.value;


            const responsavelValor =
                responsavel.value;


            const metaId =
                metaInvestimento.value ||
                null;


            const observacao =
                observacaoAporte.value.trim();


            if (
                !data ||
                !tipo ||
                !responsavelValor
            ) {

                alert(
                    "Preencha os campos obrigatórios."
                );

                return;

            }


            /* ---------------------------------------------
               VERIFICAR META
            ---------------------------------------------- */

            const metaSelecionada =
                metaId
                    ? metas.find(
                        function (meta) {

                            return (
                                meta.id ===
                                metaId
                            );

                        }
                    )
                    : null;


            if (
                metaId &&
                !metaSelecionada
            ) {

                alert(
                    "A meta selecionada não foi encontrada."
                );

                return;

            }


            if (
                metaSelecionada &&
                Number(
                    metaSelecionada.atual
                ) >=
                Number(
                    metaSelecionada.objetivo
                )
            ) {

                alert(
                    "Esta meta já foi concluída."
                );

                return;

            }


            /* ---------------------------------------------
               BOTÃO
            ---------------------------------------------- */

            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Salvando...";

            }


            /* ---------------------------------------------
               INSERIR INVESTIMENTO
            ---------------------------------------------- */

            const novoInvestimento = {

                casal_id:
                    casalId,

                meta_id:
                    metaId,

                valor:
                    valor,

                data:
                    data,

                tipo:
                    tipo,

                responsavel:
                    responsavelValor,

                observacao:
                    observacao

            };


            const {
                data:
                    investimentoInserido,
                error
            } = await supabaseClient
                .from("investimentos")
                .insert(
                    novoInvestimento
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar investimento:",
                    error
                );


                alert(
                    "Não foi possível salvar o investimento."
                );


                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar";

                }


                return;

            }


            /* ---------------------------------------------
               ATUALIZAR META VINCULADA
            ---------------------------------------------- */

            if (
                metaSelecionada
            ) {

                const novoAtual =
                    Math.min(
                        Number(
                            metaSelecionada.objetivo
                        ),
                        Number(
                            metaSelecionada.atual
                        ) +
                        valor
                    );


                const {
                    data:
                        metaAtualizada,
                    error:
                        erroMeta
                } = await supabaseClient
                    .from("metas")
                    .update({
                        atual:
                            novoAtual,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        metaId
                    )
                    .eq(
                        "casal_id",
                        casalId
                    )
                    .select()
                    .single();


                if (erroMeta) {

                    console.error(
                        "❌ Erro ao atualizar meta:",
                        erroMeta
                    );


                    /* -------------------------------------
                       DESFAZER INVESTIMENTO
                    -------------------------------------- */

                    await supabaseClient
                        .from("investimentos")
                        .delete()
                        .eq(
                            "id",
                            investimentoInserido.id
                        )
                        .eq(
                            "casal_id",
                            casalId
                        );


                    alert(
                        "Não foi possível atualizar a meta. O investimento não foi mantido."
                    );


                    if (botao) {

                        botao.disabled =
                            false;

                        botao.textContent =
                            "Adicionar";

                    }


                    return;

                }


                console.log(
                    "✅ Meta atualizada:",
                    metaAtualizada
                );

            }


            /* ---------------------------------------------
               ADICIONAR NO ESTADO DA PÁGINA
            ---------------------------------------------- */

            investimentos.unshift({

                id:
                    investimentoInserido.id,

                casalId:
                    investimentoInserido.casal_id,

                metaId:
                    investimentoInserido.meta_id,

                valor:
                    Number(
                        investimentoInserido.valor
                    ) || 0,

                data:
                    investimentoInserido.data,

                tipo:
                    investimentoInserido.tipo,

                responsavel:
                    investimentoInserido.responsavel,

                observacao:
                    investimentoInserido.observacao ||
                    ""

            });


            /* ---------------------------------------------
               ATUALIZAR META NO ESTADO LOCAL
            ---------------------------------------------- */

            if (
                metaSelecionada
            ) {

                metaSelecionada.atual =
                    Math.min(
                        Number(
                            metaSelecionada.objetivo
                        ),
                        Number(
                            metaSelecionada.atual
                        ) +
                        valor
                    );

            }


            console.log(
                "✅ Investimento salvo no Supabase:",
                investimentoInserido
            );


            form.reset();


            dataAporte.value =
                dataAtual();


            atualizarTela();


            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       EXCLUIR APORTE
    ====================================================== */

    investmentHistory.addEventListener(
        "click",
        async function (evento) {

            const botao =
                evento.target.closest(
                    ".delete-button"
                );


            if (!botao) {

                return;

            }


            const id =
                botao.dataset.id;


            const investimento =
                investimentos.find(
                    function (item) {

                        return (
                            item.id ===
                            id
                        );

                    }
                );


            if (!investimento) {

                return;

            }


            const confirmar =
                confirm(
                    "Deseja excluir este aporte?"
                );


            if (!confirmar) {

                return;

            }


            botao.disabled =
                true;


            /* ---------------------------------------------
               LOCALIZAR META
            ---------------------------------------------- */

            const meta =
                investimento.metaId
                    ? metas.find(
                        function (item) {

                            return (
                                item.id ===
                                investimento.metaId
                            );

                        }
                    )
                    : null;


            let valorMetaAnterior =
                null;


            let valorMetaNovo =
                null;


            /* ---------------------------------------------
               ATUALIZAR META ANTES DA EXCLUSÃO
            ---------------------------------------------- */

            if (
                meta
            ) {

                valorMetaAnterior =
                    Number(
                        meta.atual
                    ) || 0;


                valorMetaNovo =
                    Math.max(
                        0,
                        valorMetaAnterior -
                        Number(
                            investimento.valor
                        )
                    );


                const {
                    error:
                        erroMeta
                } = await supabaseClient
                    .from("metas")
                    .update({
                        atual:
                            valorMetaNovo,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        meta.id
                    )
                    .eq(
                        "casal_id",
                        casalId
                    );


                if (erroMeta) {

                    console.error(
                        "❌ Erro ao atualizar meta antes da exclusão:",
                        erroMeta
                    );


                    alert(
                        "Não foi possível atualizar a meta."
                    );


                    botao.disabled =
                        false;

                    return;

                }

            }


            /* ---------------------------------------------
               EXCLUIR INVESTIMENTO
            ---------------------------------------------- */

            const {
                error
            } = await supabaseClient
                .from("investimentos")
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
                    "❌ Erro ao excluir investimento:",
                    error
                );


                /* -----------------------------------------
                   RESTAURAR META CASO NECESSÁRIO
                ------------------------------------------ */

                if (
                    meta &&
                    valorMetaAnterior !== null
                ) {

                    await supabaseClient
                        .from("metas")
                        .update({
                            atual:
                                valorMetaAnterior,

                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            "id",
                            meta.id
                        )
                        .eq(
                            "casal_id",
                            casalId
                        );

                }


                alert(
                    "Não foi possível excluir o investimento."
                );


                botao.disabled =
                    false;

                return;

            }


            /* ---------------------------------------------
               ATUALIZAR ESTADO DA PÁGINA
            ---------------------------------------------- */

            investimentos =
                investimentos.filter(
                    function (item) {

                        return (
                            item.id !==
                            id
                        );

                    }
                );


            if (
                meta &&
                valorMetaNovo !== null
            ) {

                meta.atual =
                    valorMetaNovo;

            }


            atualizarTela();


            console.log(
                "✅ Investimento excluído."
            );

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    dataAporte.value =
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
       CARREGAR METAS
    ====================================================== */

    const carregouMetas =
        await carregarMetasSupabase();


    if (
        !carregouMetas
    ) {

        return;

    }


    /* =====================================================
       MIGRAR INVESTIMENTOS ANTIGOS
    ====================================================== */

    await migrarInvestimentos();


    /* =====================================================
       CARREGAR INVESTIMENTOS
    ====================================================== */

    const carregouInvestimentos =
        await carregarInvestimentosSupabase();


    if (
        !carregouInvestimentos
    ) {

        return;

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    atualizarTela();

});