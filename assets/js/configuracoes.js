document.addEventListener(
    "DOMContentLoaded",
    async function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const usuarioNome =
        document.getElementById(
            "usuarioNome"
        );


    const usuarioInicial =
        document.getElementById(
            "usuarioInicial"
        );


    const usuarioEmail =
        document.getElementById(
            "usuarioEmail"
        );


    const novoEmail =
        document.getElementById(
            "novoEmail"
        );


    const btnAlterarEmail =
        document.getElementById(
            "btnAlterarEmail"
        );


    const btnLimparEmail =
        document.getElementById(
            "btnLimparEmail"
        );


    const nomeCasal =
        document.getElementById(
            "nomeCasal"
        );


    const nomePessoa1 =
        document.getElementById(
            "nomePessoa1"
        );


    const nomePessoa2 =
        document.getElementById(
            "nomePessoa2"
        );


    const btnSalvarNomes =
        document.getElementById(
            "btnSalvarNomes"
        );


    const novaSenha =
        document.getElementById(
            "novaSenha"
        );


    const confirmarSenha =
        document.getElementById(
            "confirmarSenha"
        );


    const btnAlterarSenha =
        document.getElementById(
            "btnAlterarSenha"
        );


    const btnLimparSenha =
        document.getElementById(
            "btnLimparSenha"
        );


    const configStatus =
        document.getElementById(
            "configStatus"
        );


    const sessaoInfo =
        document.getElementById(
            "sessaoInfo"
        );


    /* =====================================================
       ESTADO
    ====================================================== */

    let usuarioAtual =
        null;


    let casalAtual =
        null;


    let membros =
        [];


    let membroAtual =
        null;


    /* =====================================================
       STATUS
    ====================================================== */

    function mostrarStatus(
        mensagem
    ) {

        if (!configStatus) {
            return;
        }


        configStatus.textContent =
            mensagem;


        configStatus.classList.add(
            "visible"
        );


        clearTimeout(
            mostrarStatus.timer
        );


        mostrarStatus.timer =
            setTimeout(
                function () {

                    configStatus.classList.remove(
                        "visible"
                    );

                },
                4000
            );

    }


    /* =====================================================
       USUÁRIO
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

        console.error(
            "❌ Usuário não autenticado:",
            userError
        );

        window.location.href =
            "../login.html";

        return;

    }


    usuarioAtual =
        user;


    console.log(
        "👤 Usuário:",
        usuarioAtual.email
    );


    if (usuarioEmail) {

        usuarioEmail.value =
            usuarioAtual.email || "";

    }


    if (sessaoInfo) {

        sessaoInfo.textContent =
            `Sessão ativa como ${usuarioAtual.email}.`;

    }


    /* =====================================================
       LOCALIZAR MEMBRO
    ====================================================== */

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
            "❌ Erro ao localizar usuário no casal:",
            membroError
        );

        mostrarStatus(
            "Não foi possível identificar o seu cadastro."
        );

        return;

    }


    membroAtual =
        membro;


    const casalId =
        membroAtual.casal_id;


    console.log(
        "✅ Casal:",
        casalId
    );


    /* =====================================================
       CARREGAR CASAL E MEMBROS
    ====================================================== */

    async function carregarConfiguracao() {


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
                    casal_id,
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
            casalResultado.error
        ) {

            throw new Error(
                `Erro ao carregar casal: ${
                    casalResultado.error.message
                }`
            );

        }


        if (
            membrosResultado.error
        ) {

            throw new Error(
                `Erro ao carregar membros: ${
                    membrosResultado.error.message
                }`
            );

        }


        casalAtual =
            casalResultado.data;


        membros =
            membrosResultado.data ||
            [];


        preencherTela();

    }


    /* =====================================================
       IDENTIFICAR NOMES
    ====================================================== */

    function identificarNomes() {

        let pessoa1 =
            null;


        let pessoa2 =
            null;


        /*
            Primeiro tentamos identificar pela
            correspondência com casais.nome1 / nome2.
        */

        pessoa1 =
            membros.find(
                function (item) {

                    return (
                        item.nome_exibicao ===
                        casalAtual.nome1
                    );

                }
            );


        pessoa2 =
            membros.find(
                function (item) {

                    return (
                        item.nome_exibicao ===
                        casalAtual.nome2
                    );

                }
            );


        /*
            Caso algum deles não seja encontrado,
            usamos a ordem de criação.
        */

        if (!pessoa1) {

            pessoa1 =
                membros[0] ||
                null;

        }


        if (
            !pessoa2 ||
            pessoa2.id === pessoa1?.id
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


        return {

            pessoa1,
            pessoa2

        };

    }


    /* =====================================================
       PREENCHER TELA
    ====================================================== */

    function preencherTela() {

        const nomes =
            identificarNomes();


        /*
            Usuário atual
        */

        if (usuarioNome) {

            usuarioNome.textContent =
                membroAtual.nome_exibicao ||
                "Usuário";

        }


        if (usuarioInicial) {

            const nome =
                membroAtual.nome_exibicao ||
                "?";


            usuarioInicial.textContent =
                nome
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }


        /*
            Dados do casal
        */

        if (nomeCasal) {

            nomeCasal.value =
                casalAtual.nome_casal ||
                "";

        }


        if (nomePessoa1) {

            nomePessoa1.value =
                casalAtual.nome1 ||
                nomes.pessoa1
                    ?.nome_exibicao ||
                "";

        }


        if (nomePessoa2) {

            nomePessoa2.value =
                casalAtual.nome2 ||
                nomes.pessoa2
                    ?.nome_exibicao ||
                "";

        }


        console.log(
            "✅ Configuração carregada."
        );

    }


    /* =====================================================
       ALTERAR E-MAIL
    ====================================================== */

    async function alterarEmail() {

        const email =
            novoEmail
                ?.value
                .trim();


        if (
            !email
        ) {

            alert(
                "Informe o novo e-mail."
            );

            return;

        }


        const emailAtual =
            usuarioAtual
                ?.email
                ?.trim()
                .toLowerCase();


        const novoEmailNormalizado =
            email
                .toLowerCase();


        if (
            novoEmailNormalizado ===
            emailAtual
        ) {

            alert(
                "O novo e-mail precisa ser diferente do e-mail atual."
            );

            return;

        }


        /*
            Validação básica do formato
            do e-mail.
        */

        const formatoEmail =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !formatoEmail.test(email)
        ) {

            alert(
                "Informe um e-mail válido."
            );

            return;

        }


        if (
            btnAlterarEmail
        ) {

            btnAlterarEmail.disabled =
                true;

            btnAlterarEmail.textContent =
                "Enviando...";

        }


        try {

            const {
                data,
                error
            } = await supabaseClient
                .auth
                .updateUser({

                    email:
                        email

                });


            if (error) {

                throw new Error(
                    error.message
                );

            }


            console.log(
                "✅ Solicitação de alteração de e-mail enviada:",
                data
            );


            if (novoEmail) {

                novoEmail.value =
                    "";

            }


            mostrarStatus(
                "Solicitação enviada. Verifique seu e-mail para concluir a alteração."
            );


        } catch (
            erro
        ) {

            console.error(
                "❌ Erro ao alterar e-mail:",
                erro
            );


            mostrarStatus(
                `Não foi possível alterar o e-mail: ${
                    erro.message
                }`
            );

        } finally {

            if (
                btnAlterarEmail
            ) {

                btnAlterarEmail.disabled =
                    false;

                btnAlterarEmail.textContent =
                    "Alterar e-mail";

            }

        }

    }


    /* =====================================================
       LIMPAR E-MAIL
    ====================================================== */

    function limparEmail() {

        if (novoEmail) {

            novoEmail.value =
                "";

        }

    }


    /* =====================================================
       SALVAR NOMES
    ====================================================== */

    async function salvarNomes() {

        const casal =
            nomeCasal
                ?.value
                .trim();


        const pessoa1Nome =
            nomePessoa1
                ?.value
                .trim();


        const pessoa2Nome =
            nomePessoa2
                ?.value
                .trim();


        if (
            !casal ||
            !pessoa1Nome ||
            !pessoa2Nome
        ) {

            alert(
                "Preencha o nome do casal e os dois nomes."
            );

            return;

        }


        if (
            pessoa1Nome.length < 2 ||
            pessoa2Nome.length < 2
        ) {

            alert(
                "Informe nomes válidos."
            );

            return;

        }


        const nomes =
            identificarNomes();


        if (
            !nomes.pessoa1 ||
            !nomes.pessoa2
        ) {

            alert(
                "Não foi possível identificar os dois membros do casal."
            );

            return;

        }


        if (
            btnSalvarNomes
        ) {

            btnSalvarNomes.disabled =
                true;

            btnSalvarNomes.textContent =
                "Salvando...";

        }


        try {


            /* =============================================
               ATUALIZAR CASAL
            ============================================== */

            const {
                error: casalError
            } = await supabaseClient
                .from("casais")
                .update({

                    nome_casal:
                        casal,

                    nome1:
                        pessoa1Nome,

                    nome2:
                        pessoa2Nome

                })
                .eq(
                    "id",
                    casalId
                );


            if (
                casalError
            ) {

                throw new Error(
                    `Erro ao atualizar casal: ${
                        casalError.message
                    }`
                );

            }


            /* =============================================
               ATUALIZAR MEMBRO 1
            ============================================== */

            const {
                error: pessoa1Error
            } = await supabaseClient
                .from("membros")
                .update({

                    nome_exibicao:
                        pessoa1Nome

                })
                .eq(
                    "id",
                    nomes.pessoa1.id
                )
                .eq(
                    "casal_id",
                    casalId
                );


            if (
                pessoa1Error
            ) {

                throw new Error(
                    `Erro ao atualizar pessoa 1: ${
                        pessoa1Error.message
                    }`
                );

            }


            /* =============================================
               ATUALIZAR MEMBRO 2
            ============================================== */

            const {
                error: pessoa2Error
            } = await supabaseClient
                .from("membros")
                .update({

                    nome_exibicao:
                        pessoa2Nome

                })
                .eq(
                    "id",
                    nomes.pessoa2.id
                )
                .eq(
                    "casal_id",
                    casalId
                );


            if (
                pessoa2Error
            ) {

                throw new Error(
                    `Erro ao atualizar pessoa 2: ${
                        pessoa2Error.message
                    }`
                );

            }


            /* =============================================
               ATUALIZAR ESTADO LOCAL
            ============================================== */

            casalAtual.nome_casal =
                casal;


            casalAtual.nome1 =
                pessoa1Nome;


            casalAtual.nome2 =
                pessoa2Nome;


            nomes.pessoa1.nome_exibicao =
                pessoa1Nome;


            nomes.pessoa2.nome_exibicao =
                pessoa2Nome;


            if (
                membroAtual.id ===
                nomes.pessoa1.id
            ) {

                membroAtual.nome_exibicao =
                    pessoa1Nome;

            }


            if (
                membroAtual.id ===
                nomes.pessoa2.id
            ) {

                membroAtual.nome_exibicao =
                    pessoa2Nome;

            }


            preencherTela();


            /*
                Avisar o sistema para atualizar os nomes
                que estiverem na tela.
            */

            window.dispatchEvent(
                new CustomEvent(
                    "casalNomesAtualizados",
                    {
                        detail: {

                            nomeCasal:
                                casal,

                            nome1:
                                pessoa1Nome,

                            nome2:
                                pessoa2Nome

                        }
                    }
                )
            );


            mostrarStatus(
                "Nomes atualizados com sucesso."
            );


            console.log(
                "✅ Nomes do casal atualizados."
            );


        } catch (
            erro
        ) {

            console.error(
                "❌ Erro ao salvar nomes:",
                erro
            );


            mostrarStatus(
                erro.message
            );

        } finally {

            if (
                btnSalvarNomes
            ) {

                btnSalvarNomes.disabled =
                    false;

                btnSalvarNomes.textContent =
                    "Salvar nomes";

            }

        }

    }


    /* =====================================================
       ALTERAR SENHA
    ====================================================== */

    async function alterarSenha() {

        const senha =
            novaSenha
                ?.value || "";


        const confirmacao =
            confirmarSenha
                ?.value || "";


        if (
            !senha
        ) {

            alert(
                "Informe a nova senha."
            );

            return;

        }


        if (
            senha.length < 6
        ) {

            alert(
                "A nova senha deve possuir pelo menos 6 caracteres."
            );

            return;

        }


        if (
            senha !==
            confirmacao
        ) {

            alert(
                "As senhas não são iguais."
            );

            return;

        }


        if (
            btnAlterarSenha
        ) {

            btnAlterarSenha.disabled =
                true;

            btnAlterarSenha.textContent =
                "Atualizando...";

        }


        try {

            const {
                error
            } = await supabaseClient
                .auth
                .updateUser({

                    password:
                        senha

                });


            if (error) {

                throw new Error(
                    error.message
                );

            }


            if (novaSenha) {

                novaSenha.value =
                    "";

            }


            if (confirmarSenha) {

                confirmarSenha.value =
                    "";

            }


            mostrarStatus(
                "Senha alterada com sucesso."
            );


            console.log(
                "✅ Senha atualizada."
            );


        } catch (
            erro
        ) {

            console.error(
                "❌ Erro ao alterar senha:",
                erro
            );


            mostrarStatus(
                `Não foi possível alterar a senha: ${
                    erro.message
                }`
            );

        } finally {

            if (
                btnAlterarSenha
            ) {

                btnAlterarSenha.disabled =
                    false;

                btnAlterarSenha.textContent =
                    "Alterar senha";

            }

        }

    }


    /* =====================================================
       LIMPAR SENHA
    ====================================================== */

    function limparSenha() {

        if (novaSenha) {

            novaSenha.value =
                "";

        }


        if (confirmarSenha) {

            confirmarSenha.value =
                "";

        }

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    if (
        btnAlterarEmail
    ) {

        btnAlterarEmail.addEventListener(
            "click",
            alterarEmail
        );

    }


    if (
        btnLimparEmail
    ) {

        btnLimparEmail.addEventListener(
            "click",
            limparEmail
        );

    }


    if (
        btnSalvarNomes
    ) {

        btnSalvarNomes.addEventListener(
            "click",
            salvarNomes
        );

    }


    if (
        btnAlterarSenha
    ) {

        btnAlterarSenha.addEventListener(
            "click",
            alterarSenha
        );

    }


    if (
        btnLimparSenha
    ) {

        btnLimparSenha.addEventListener(
            "click",
            limparSenha
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    try {

        await carregarConfiguracao();

    } catch (
        erro
    ) {

        console.error(
            "❌ Erro ao carregar configurações:",
            erro
        );


        mostrarStatus(
            erro.message
        );

    }


});