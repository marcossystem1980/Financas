/* =========================================================
   LOGIN | FINANÇAS-CASAL
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    async function () {


    /* =====================================================
       ELEMENTOS - LOGIN
    ====================================================== */

    const loginPanel =
        document.getElementById(
            "loginPanel"
        );


    const loginForm =
        document.getElementById(
            "loginForm"
        );


    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const loginMessage =
        document.getElementById(
            "loginMessage"
        );


    const togglePassword =
        document.getElementById(
            "togglePassword"
        );


    const btnEsqueciSenha =
        document.getElementById(
            "btnEsqueciSenha"
        );


    /* =====================================================
       ELEMENTOS - RECUPERAÇÃO
    ====================================================== */

    const recoveryPanel =
        document.getElementById(
            "recoveryPanel"
        );


    const recoveryForm =
        document.getElementById(
            "recoveryForm"
        );


    const recoveryEmail =
        document.getElementById(
            "recoveryEmail"
        );


    const recoveryButton =
        document.getElementById(
            "recoveryButton"
        );


    const recoveryMessage =
        document.getElementById(
            "recoveryMessage"
        );


    const btnVoltarLogin =
        document.getElementById(
            "btnVoltarLogin"
        );


    /* =====================================================
       ELEMENTOS - NOVA SENHA
    ====================================================== */

    const newPasswordPanel =
        document.getElementById(
            "newPasswordPanel"
        );


    const newPasswordForm =
        document.getElementById(
            "newPasswordForm"
        );


    const newPassword =
        document.getElementById(
            "newPassword"
        );


    const confirmNewPassword =
        document.getElementById(
            "confirmNewPassword"
        );


    const newPasswordButton =
        document.getElementById(
            "newPasswordButton"
        );


    const newPasswordMessage =
        document.getElementById(
            "newPasswordMessage"
        );


    /* =====================================================
       FUNÇÃO - MENSAGEM LOGIN
    ====================================================== */

    function mostrarMensagem(
        mensagem,
        tipo = "error"
    ) {

        if (!loginMessage) {
            return;
        }


        loginMessage.textContent =
            mensagem;


        loginMessage.className =
            "login-message";


        if (mensagem) {

            loginMessage.classList.add(
                tipo
            );

        }

    }


    /* =====================================================
       FUNÇÃO - MENSAGEM RECUPERAÇÃO
    ====================================================== */

    function mostrarMensagemRecuperacao(
        mensagem,
        tipo = "error"
    ) {

        if (!recoveryMessage) {
            return;
        }


        recoveryMessage.textContent =
            mensagem;


        recoveryMessage.className =
            "login-message";


        if (mensagem) {

            recoveryMessage.classList.add(
                tipo
            );

        }

    }


    /* =====================================================
       FUNÇÃO - MENSAGEM NOVA SENHA
    ====================================================== */

    function mostrarMensagemNovaSenha(
        mensagem,
        tipo = "error"
    ) {

        if (!newPasswordMessage) {
            return;
        }


        newPasswordMessage.textContent =
            mensagem;


        newPasswordMessage.className =
            "login-message";


        if (mensagem) {

            newPasswordMessage.classList.add(
                tipo
            );

        }

    }


    /* =====================================================
       MOSTRAR PAINEL
    ====================================================== */

    function mostrarPainel(
        painel
    ) {

        if (loginPanel) {

            loginPanel.style.display =
                painel === "login"
                    ? "block"
                    : "none";

        }


        if (recoveryPanel) {

            recoveryPanel.style.display =
                painel === "recovery"
                    ? "block"
                    : "none";

        }


        if (newPasswordPanel) {

            newPasswordPanel.style.display =
                painel === "password"
                    ? "block"
                    : "none";

        }

    }


    /* =====================================================
       MOSTRAR / ESCONDER SENHA
    ====================================================== */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            function () {

                const senhaVisivel =
                    passwordInput.type ===
                    "text";


                passwordInput.type =
                    senhaVisivel
                        ? "password"
                        : "text";


                togglePassword.textContent =
                    senhaVisivel
                        ? "Mostrar"
                        : "Ocultar";


                togglePassword.setAttribute(
                    "aria-label",
                    senhaVisivel
                        ? "Mostrar senha"
                        : "Ocultar senha"
                );

            }
        );

    }


    /* =====================================================
       ABRIR RECUPERAÇÃO
    ====================================================== */

    if (btnEsqueciSenha) {

        btnEsqueciSenha.addEventListener(
            "click",
            function () {

                const emailAtual =
                    emailInput?.value.trim();


                if (
                    recoveryEmail &&
                    emailAtual
                ) {

                    recoveryEmail.value =
                        emailAtual;

                }


                mostrarMensagemRecuperacao(
                    ""
                );


                mostrarPainel(
                    "recovery"
                );


                setTimeout(
                    function () {

                        if (recoveryEmail) {

                            recoveryEmail.focus();

                        }

                    },
                    50
                );

            }
        );

    }


    /* =====================================================
       VOLTAR PARA LOGIN
    ====================================================== */

    if (btnVoltarLogin) {

        btnVoltarLogin.addEventListener(
            "click",
            function () {

                mostrarMensagem(
                    ""
                );


                mostrarMensagemRecuperacao(
                    ""
                );


                mostrarPainel(
                    "login"
                );


                if (emailInput) {

                    emailInput.focus();

                }

            }
        );

    }


    /* =====================================================
       VERIFICAR SESSÃO EXISTENTE
    ====================================================== */

    const {
        data: {
            session
        }
    } = await supabaseClient
        .auth
        .getSession();


    /*
        Durante recuperação de senha,
        existe uma sessão especial.
        Nesse caso não devemos redirecionar
        para o Dashboard.
    */

    const estaEmRecuperacao =
        window.location.hash.includes(
            "type=recovery"
        );


    if (
        session &&
        !estaEmRecuperacao
    ) {

        window.location.href =
            "index.html";

        return;

    }


    /* =====================================================
       LOGIN
    ====================================================== */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    emailInput
                        .value
                        .trim();


                const password =
                    passwordInput.value;


                if (
                    !email ||
                    !password
                ) {

                    mostrarMensagem(
                        "Informe seu e-mail e sua senha."
                    );

                    return;

                }


                loginButton.disabled =
                    true;


                loginButton.textContent =
                    "Entrando...";


                mostrarMensagem(
                    ""
                );


                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({

                            email,

                            password

                        });


                if (error) {

                    console.error(
                        "Erro no login:",
                        error
                    );


                    mostrarMensagem(
                        "E-mail ou senha inválidos."
                    );


                    loginButton.disabled =
                        false;


                    loginButton.textContent =
                        "Entrar";


                    return;

                }


                if (
                    data?.session
                ) {

                    mostrarMensagem(
                        "Login realizado. Entrando...",
                        "success"
                    );


                    window.location.href =
                        "index.html";


                    return;

                }


                mostrarMensagem(
                    "Não foi possível iniciar a sessão."
                );


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Entrar";

            }
        );

    }


    /* =====================================================
       SOLICITAR RECUPERAÇÃO
    ====================================================== */

    if (recoveryForm) {

        recoveryForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    recoveryEmail
                        .value
                        .trim();


                if (!email) {

                    mostrarMensagemRecuperacao(
                        "Informe seu e-mail."
                    );

                    return;

                }


                const formatoEmail =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


                if (
                    !formatoEmail.test(
                        email
                    )
                ) {

                    mostrarMensagemRecuperacao(
                        "Informe um e-mail válido."
                    );

                    return;

                }


                recoveryButton.disabled =
                    true;


                recoveryButton.textContent =
                    "Enviando...";


                mostrarMensagemRecuperacao(
                    ""
                );


                try {


                    /*
                        O link de recuperação
                        retorna para esta própria
                        tela de login.
                    */

                    const redirectTo =
                        window.location.origin +
                        window.location.pathname;


                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .resetPasswordForEmail(
                                email,
                                {
                                    redirectTo
                                }
                            );


                    if (error) {

                        throw new Error(
                            error.message
                        );

                    }


                    /*
                        Não informamos se o e-mail
                        existe ou não.
                        Isso é o comportamento
                        recomendado pelo Supabase.
                    */

                    mostrarMensagemRecuperacao(
                        "Se este e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.",
                        "success"
                    );


                    recoveryButton.textContent =
                        "Link enviado";


                } catch (
                    erro
                ) {

                    console.error(
                        "Erro ao solicitar recuperação:",
                        erro
                    );


                    mostrarMensagemRecuperacao(
                        `Não foi possível solicitar a recuperação: ${erro.message}`
                    );


                    recoveryButton.disabled =
                        false;


                    recoveryButton.textContent =
                        "Enviar recuperação";

                }

            }
        );

    }


    /* =====================================================
       EVENTO DE RECUPERAÇÃO DO SUPABASE
    ====================================================== */

    supabaseClient
        .auth
        .onAuthStateChange(
            function (event) {

                console.log(
                    "🔐 Evento Auth:",
                    event
                );


                if (
                    event ===
                    "PASSWORD_RECOVERY"
                ) {

                    mostrarPainel(
                        "password"
                    );


                    mostrarMensagemNovaSenha(
                        ""
                    );


                    setTimeout(
                        function () {

                            if (newPassword) {

                                newPassword.focus();

                            }

                        },
                        100
                    );

                }

            }
        );


    /* =====================================================
       SALVAR NOVA SENHA
    ====================================================== */

    if (newPasswordForm) {

        newPasswordForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const senha =
                    newPassword.value;


                const confirmacao =
                    confirmNewPassword.value;


                if (!senha) {

                    mostrarMensagemNovaSenha(
                        "Informe a nova senha."
                    );

                    return;

                }


                if (
                    senha.length < 6
                ) {

                    mostrarMensagemNovaSenha(
                        "A nova senha deve possuir pelo menos 6 caracteres."
                    );

                    return;

                }


                if (
                    senha !==
                    confirmacao
                ) {

                    mostrarMensagemNovaSenha(
                        "As senhas não são iguais."
                    );

                    return;

                }


                newPasswordButton.disabled =
                    true;


                newPasswordButton.textContent =
                    "Salvando...";


                mostrarMensagemNovaSenha(
                    ""
                );


                try {

                    const {
                        error
                    } =
                        await supabaseClient
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


                    if (newPassword) {

                        newPassword.value =
                            "";

                    }


                    if (
                        confirmNewPassword
                    ) {

                        confirmNewPassword.value =
                            "";

                    }


                    mostrarMensagemNovaSenha(
                        "Senha alterada com sucesso!",
                        "success"
                    );


                    /*
                        Encerramos a sessão de recuperação
                        para que o usuário faça um novo
                        login normalmente com a nova senha.
                    */

                    setTimeout(
                        async function () {

                            await supabaseClient
                                .auth
                                .signOut({
                                    scope: "local"
                                });


                            mostrarPainel(
                                "login"
                            );


                            mostrarMensagem(
                                "Senha redefinida. Entre com sua nova senha.",
                                "success"
                            );


                            if (
                                emailInput &&
                                recoveryEmail
                            ) {

                                emailInput.value =
                                    recoveryEmail.value;

                            }


                            if (
                                passwordInput
                            ) {

                                passwordInput.value =
                                    "";

                                passwordInput.focus();

                            }

                        },
                        1200
                    );


                } catch (
                    erro
                ) {

                    console.error(
                        "Erro ao redefinir senha:",
                        erro
                    );


                    mostrarMensagemNovaSenha(
                        `Não foi possível alterar a senha: ${erro.message}`
                    );


                    newPasswordButton.disabled =
                        false;


                    newPasswordButton.textContent =
                        "Salvar nova senha";

                }

            }
        );


    }


});