/* =========================================================
   NOMES DO CASAL
   Finanças do Casal
========================================================= */

(async function () {


    /* =====================================================
       ESTADO
    ====================================================== */

    let nomesCasal = {

        casal:
            "Nosso Casal",

        pessoa1:
            "Pessoa 1",

        pessoa2:
            "Pessoa 2",

        proprio:
            "Você",

        parceiro:
            "Sua esposa"

    };


    let usuarioAtual =
        null;


    /* =====================================================
       ESCAPAR TEXTO
    ====================================================== */

    function escaparRegex(
        texto
    ) {

        return String(
            texto
        ).replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    }


    /* =====================================================
       OBTER USUÁRIO
    ====================================================== */

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

        return;

    }


    usuarioAtual =
        user;


    /* =====================================================
       CARREGAR NOMES
    ====================================================== */

    async function carregarNomes() {

        const {
            data: membro,
            error: membroError
        } = await supabaseClient
            .from("membros")
            .select(
                `
                id,
                casal_id,
                nome_exibicao,
                created_at
                `
            )
            .eq(
                "id",
                usuarioAtual.id
            )
            .single();


        if (
            membroError ||
            !membro
        ) {

            console.error(
                "❌ Não foi possível localizar membro:",
                membroError
            );

            return;

        }


        const casalId =
            membro.casal_id;


        const [
            casalResultado,
            membrosResultado
        ] = await Promise.all([


            supabaseClient
                .from("casais")
                .select(
                    `
                    id,
                    nome_casal,
                    nome1,
                    nome2
                    `
                )
                .eq(
                    "id",
                    casalId
                )
                .single(),


            supabaseClient
                .from("membros")
                .select(
                    `
                    id,
                    nome_exibicao,
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
                )

        ]);


        if (
            casalResultado.error ||
            !casalResultado.data
        ) {

            console.error(
                "❌ Erro ao carregar casal:",
                casalResultado.error
            );

            return;

        }


        if (
            membrosResultado.error
        ) {

            console.error(
                "❌ Erro ao carregar membros:",
                membrosResultado.error
            );

            return;

        }


        const casal =
            casalResultado.data;


        const membros =
            membrosResultado.data ||
            [];


        /* =============================================
           Identificar pessoa 1 e pessoa 2
        ============================================== */

        let pessoa1 =
            membros.find(
                function (item) {

                    return (
                        item.nome_exibicao ===
                        casal.nome1
                    );

                }
            );


        let pessoa2 =
            membros.find(
                function (item) {

                    return (
                        item.nome_exibicao ===
                        casal.nome2
                    );

                }
            );


        if (!pessoa1) {

            pessoa1 =
                membros[0] ||
                null;

        }


        if (
            !pessoa2 ||
            pessoa2.id ===
            pessoa1?.id
        ) {

            pessoa2 =
                membros.find(
                    function (item) {

                        return (
                            item.id !==
                            pessoa1?.id
                        );

                    }
                ) ||
                null;

        }


        /* =============================================
           Identificar próprio nome
        ============================================== */

        const proprio =
            membro.id ===
            pessoa1?.id
                ? (
                    casal.nome1 ||
                    pessoa1?.nome_exibicao ||
                    "Você"
                )
                : (
                    casal.nome2 ||
                    pessoa2?.nome_exibicao ||
                    "Você"
                );


        const parceiro =
            membro.id ===
            pessoa1?.id
                ? (
                    casal.nome2 ||
                    pessoa2?.nome_exibicao ||
                    "Sua esposa"
                )
                : (
                    casal.nome1 ||
                    pessoa1?.nome_exibicao ||
                    "Sua esposa"
                );


        nomesCasal = {

            casal:
                casal.nome_casal ||
                "Nosso Casal",

            pessoa1:
                casal.nome1 ||
                pessoa1?.nome_exibicao ||
                "Pessoa 1",

            pessoa2:
                casal.nome2 ||
                pessoa2?.nome_exibicao ||
                "Pessoa 2",

            proprio:
                proprio,

            parceiro:
                parceiro

        };


        console.log(
            "✅ Nomes carregados:",
            nomesCasal
        );


        atualizarTextoDaPagina();


        window.dispatchEvent(
            new CustomEvent(
                "casalNomesCarregados",
                {
                    detail:
                        nomesCasal
                }
            )
        );

    }


    /* =====================================================
       SUBSTITUIR TEXTO
    ====================================================== */

    function substituirTexto(
        texto
    ) {

        if (
            !texto
        ) {

            return texto;

        }


        let novoTexto =
            texto;


        /*
            Primeiro "Sua esposa"
            para evitar conflito com "Você".
        */

        const regexParceiro =
            new RegExp(
                `\\bSua esposa\\b`,
                "gi"
            );


        const regexVoce =
            new RegExp(
                `\\bVocê\\b`,
                "g"
            );


        novoTexto =
            novoTexto.replace(
                regexParceiro,
                nomesCasal.parceiro
            );


        novoTexto =
            novoTexto.replace(
                regexVoce,
                nomesCasal.proprio
            );


        return novoTexto;

    }


    /* =====================================================
       ATUALIZAR TEXTO DO DOM
    ====================================================== */

    function atualizarTextoDaPagina(
        raiz = document.body
    ) {

        if (
            !raiz
        ) {

            return;

        }


        const walker =
            document.createTreeWalker(
                raiz,
                NodeFilter.SHOW_TEXT
            );


        const nos = [];


        let atual;


        while (
            atual =
                walker.nextNode()
        ) {

            nos.push(
                atual
            );

        }


        nos.forEach(
            function (
                no
            ) {

                const elementoPai =
                    no.parentElement;


                if (!elementoPai) {

                    return;

                }


                const tag =
                    elementoPai.tagName;


                /*
                    Não alterar código nem campos
                    digitados pelo usuário.
                */

                if (
                    [
                        "SCRIPT",
                        "STYLE",
                        "TEXTAREA",
                        "INPUT"
                    ].includes(
                        tag
                    )
                ) {

                    return;

                }


                const textoOriginal =
                    no.nodeValue;


                const textoNovo =
                    substituirTexto(
                        textoOriginal
                    );


                if (
                    textoNovo !==
                    textoOriginal
                ) {

                    no.nodeValue =
                        textoNovo;

                }

            }
        );

    }


    /* =====================================================
       OBSERVADOR
    ====================================================== */

    const observer =
        new MutationObserver(
            function (
                mutacoes
            ) {

                let precisaAtualizar =
                    false;


                mutacoes.forEach(
                    function (
                        mutacao
                    ) {

                        if (
                            mutacao.type ===
                            "childList" &&
                            mutacao.addedNodes.length
                        ) {

                            precisaAtualizar =
                                true;

                        }

                    }
                );


                if (
                    precisaAtualizar
                ) {

                    atualizarTextoDaPagina();

                }

            }
        );


    observer.observe(
        document.body,
        {
            childList: true,
            subtree: true
        }
    );


    /* =====================================================
       ATUALIZAÇÃO APÓS CONFIGURAÇÕES
    ====================================================== */

    window.addEventListener(
        "casalNomesAtualizados",
        async function () {

            await carregarNomes();

        }
    );


    /* =====================================================
       API GLOBAL
    ====================================================== */

    window.CasalNomes = {

        obter: function () {

            return {
                ...nomesCasal
            };

        },


        proprio: function () {

            return nomesCasal.proprio;

        },


        parceiro: function () {

            return nomesCasal.parceiro;

        },


        casal: function () {

            return nomesCasal.casal;

        },


        pessoa1: function () {

            return nomesCasal.pessoa1;

        },


        pessoa2: function () {

            return nomesCasal.pessoa2;

        }

    };


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    await carregarNomes();


})();