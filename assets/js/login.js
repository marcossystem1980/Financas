document.addEventListener("DOMContentLoaded", async () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const loginButton = document.getElementById("loginButton");
    const loginMessage = document.getElementById("loginMessage");
    const togglePassword = document.getElementById("togglePassword");

    function mostrarMensagem(mensagem, tipo = "error") {

        loginMessage.textContent = mensagem;

        loginMessage.className = "login-message";

        if (mensagem) {
            loginMessage.classList.add(tipo);
        }
    }

    // Mostra / esconde senha
    togglePassword.addEventListener("click", () => {

        const senhaVisivel =
            passwordInput.type === "text";

        passwordInput.type =
            senhaVisivel ? "password" : "text";

        togglePassword.textContent =
            senhaVisivel ? "Mostrar" : "Ocultar";

        togglePassword.setAttribute(
            "aria-label",
            senhaVisivel
                ? "Mostrar senha"
                : "Ocultar senha"
        );
    });

    // Verifica se já existe sessão
    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();

    if (session) {
        window.location.href = "index.html";
        return;
    }

    // Login
    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        if (!email || !password) {
            mostrarMensagem(
                "Informe seu e-mail e sua senha."
            );

            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = "Entrando...";

        mostrarMensagem("");

        const {
            data,
            error
        } = await supabaseClient.auth.signInWithPassword({
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

            loginButton.disabled = false;
            loginButton.textContent = "Entrar";

            return;
        }

        if (data?.session) {

            mostrarMensagem(
                "Login realizado. Entrando...",
                "success"
            );

            window.location.href = "index.html";

            return;
        }

        mostrarMensagem(
            "Não foi possível iniciar a sessão."
        );

        loginButton.disabled = false;
        loginButton.textContent = "Entrar";
    });

});