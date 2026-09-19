(async function protegerPagina() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Erro ao verificar sessão:", error);
        window.location.href = "login.html";
        return;
    }

    if (!session) {
        window.location.href = "login.html";
        return;
    }

    console.log("✅ Usuário autenticado:", session.user.email);

})();