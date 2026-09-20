(async function protegerPagina() {

    /* =====================================================
       VERIFICAR SESSÃO
    ====================================================== */

    const {
        data: {
            session
        },
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "❌ Erro ao verificar sessão:",
            error
        );

        window.location.href = "/login.html";

        return;

    }


    if (!session) {

        window.location.href = "/login.html";

        return;

    }


    console.log(
        "✅ Usuário autenticado:",
        session.user.email
    );


    /* =====================================================
       BOTÃO SAIR
    ====================================================== */

    const botaoSair =
        document.querySelector(".logout");


    if (!botaoSair) {

        return;

    }


    botaoSair.addEventListener(
        "click",
        async function (evento) {

            evento.preventDefault();


            botaoSair.style.pointerEvents =
                "none";


            const textoOriginal =
                botaoSair.innerHTML;


            botaoSair.innerHTML = `
                <span class="menu-icon">
                    ↪
                </span>

                <span class="menu-text">
                    Saindo...
                </span>
            `;


            const {
                error
            } = await supabaseClient.auth.signOut({
                scope: "local"
            });


            if (error) {

                console.error(
                    "❌ Erro ao sair:",
                    error
                );


                botaoSair.innerHTML =
                    textoOriginal;


                botaoSair.style.pointerEvents =
                    "";


                alert(
                    "Não foi possível sair. Tente novamente."
                );

                return;

            }


            console.log(
                "✅ Sessão encerrada."
            );


            window.location.href =
                "/login.html";

        }
    );

})();