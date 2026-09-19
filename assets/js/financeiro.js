document.addEventListener("DOMContentLoaded", async function () {

    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const salario1 =
        document.getElementById("salario1");

    const salario2 =
        document.getElementById("salario2");

    const custoCasa =
        document.getElementById("custoCasa");

    const investimentos =
        document.getElementById("investimentos");

    const verba1 =
        document.getElementById("verba1");

    const verba2 =
        document.getElementById("verba2");


    const rendaTotal =
        document.getElementById("rendaTotal");

    const custoCasaResumo =
        document.getElementById("custoCasaResumo");

    const investimentosResumo =
        document.getElementById("investimentosResumo");

    const restanteResumo =
        document.getElementById("restanteResumo");


    const percentual1 =
        document.getElementById("percentual1");

    const percentual2 =
        document.getElementById("percentual2");


    const aportePercentual1 =
        document.getElementById("aportePercentual1");

    const aportePercentual2 =
        document.getElementById("aportePercentual2");


    const aporte1 =
        document.getElementById("aporte1");

    const aporte2 =
        document.getElementById("aporte2");


    const sobra1 =
        document.getElementById("sobra1");

    const sobra2 =
        document.getElementById("sobra2");


    const barraAporte1 =
        document.getElementById("barraAporte1");

    const barraAporte2 =
        document.getElementById("barraAporte2");


    /* =====================================================
       VARIÁVEIS DO SUPABASE
    ====================================================== */

    let casalId = null;

    let salvamentoTimer = null;


    /* =====================================================
       FORMATAÇÃO
    ====================================================== */

    function moeda(valor) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(valor);

    }


    /* =====================================================
       VALOR SEGURO
    ====================================================== */

    function valor(input) {

        const numero =
            parseFloat(
                input.value
            );


        if (
            Number.isNaN(numero) ||
            numero < 0
        ) {

            return 0;

        }


        return numero;

    }


    /* =====================================================
       LOCALIZAR O CASAL DO USUÁRIO
    ====================================================== */

    async function carregarCasal() {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !user) {

            console.error(
                "❌ Usuário não autenticado:",
                userError
            );

            window.location.href = "../login.html";

            return false;

        }


        const {
            data: membro,
            error: membroError
        } = await supabaseClient
            .from("membros")
            .select("casal_id, nome_exibicao")
            .eq("id", user.id)
            .single();


        if (membroError || !membro) {

            console.error(
                "❌ Não foi possível localizar o membro:",
                membroError
            );

            return false;

        }


        casalId = membro.casal_id;


        console.log(
            "✅ Casal identificado:",
            casalId
        );

        console.log(
            "👤 Usuário:",
            membro.nome_exibicao
        );


        return true;

    }


    /* =====================================================
       CARREGAR PERFIL DO SUPABASE
    ====================================================== */

    async function carregarPerfil() {

        const {
            data: perfil,
            error
        } = await supabaseClient
            .from("perfil_financeiro")
            .select("salario1, salario2")
            .eq("casal_id", casalId)
            .single();


        if (error) {

            console.error(
                "❌ Erro ao carregar perfil financeiro:",
                error
            );

            return null;

        }


        return {

            salario1:
                Number(
                    perfil.salario1
                ) || 0,

            salario2:
                Number(
                    perfil.salario2
                ) || 0

        };

    }


    /* =====================================================
       MIGRAÇÃO ÚNICA DO LOCALSTORAGE
    ====================================================== */

    async function migrarPerfilLocal() {

        const chave =
            "financasCasal_perfil";


        const dados =
            localStorage.getItem(chave);


        if (!dados) {

            return null;

        }


        try {

            const perfilLocal =
                JSON.parse(dados);


            const salarioA =
                Number(
                    perfilLocal.salario1
                ) || 0;


            const salarioB =
                Number(
                    perfilLocal.salario2
                ) || 0;


            if (
                salarioA === 0 &&
                salarioB === 0
            ) {

                return null;

            }


            console.log(
                "🔄 Perfil local encontrado. Preparando migração..."
            );


            return {

                salario1: salarioA,
                salario2: salarioB

            };

        } catch (erro) {

            console.error(
                "❌ Erro ao interpretar perfil local:",
                erro
            );

            return null;

        }

    }


    /* =====================================================
       SALVAR SALÁRIOS NO SUPABASE
    ====================================================== */

    async function salvarPerfil() {

        if (!casalId) {

            return;

        }


        const dados = {

            salario1:
                Number(
                    salario1.value
                ) || 0,

            salario2:
                Number(
                    salario2.value
                ) || 0,

            updated_at:
                new Date().toISOString()

        };


        const {
            error
        } = await supabaseClient
            .from("perfil_financeiro")
            .update(dados)
            .eq("casal_id", casalId);


        if (error) {

            console.error(
                "❌ Erro ao salvar salários:",
                error
            );

            return;

        }


        console.log(
            "✅ Salários salvos no Supabase."
        );

    }


    /* =====================================================
       SALVAR COM PEQUENO ATRASO
       evita várias gravações enquanto o usuário digita
    ====================================================== */

    function programarSalvamento() {

        clearTimeout(
            salvamentoTimer
        );


        salvamentoTimer =
            setTimeout(
                salvarPerfil,
                700
            );

    }


    /* =====================================================
       CARREGAR SALÁRIOS
    ====================================================== */

    async function carregarSalarios() {

        const perfil =
            await carregarPerfil();


        if (!perfil) {

            return;

        }


        /*
           Verifica se ainda existem dados antigos
           no localStorage para fazer a primeira migração.
        */

        const perfilLocal =
            await migrarPerfilLocal();


        if (
            perfil.salario1 === 0 &&
            perfil.salario2 === 0 &&
            perfilLocal
        ) {

            console.log(
                "📦 Migrando salários do localStorage para o Supabase..."
            );


            salario1.value =
                perfilLocal.salario1;


            salario2.value =
                perfilLocal.salario2;


            await salvarPerfil();

            return;

        }


        salario1.value =
            perfil.salario1;


        salario2.value =
            perfil.salario2;

    }


    /* =====================================================
       ATUALIZAR FINANCEIRO
    ====================================================== */

    function atualizarFinanceiro() {


        /* -----------------------------------------------
           SALÁRIOS
        ------------------------------------------------ */

        const salarioA =
            valor(salario1);

        const salarioB =
            valor(salario2);


        /* -----------------------------------------------
           OUTROS VALORES
        ------------------------------------------------ */

        const casa =
            valor(custoCasa);

        const investimento =
            valor(investimentos);

        const verbaA =
            valor(verba1);

        const verbaB =
            valor(verba2);


        /* -----------------------------------------------
           RENDA TOTAL
        ------------------------------------------------ */

        const total =
            salarioA + salarioB;


        /* -----------------------------------------------
           PERCENTUAL DE CADA UM
        ------------------------------------------------ */

        let percentualA = 0;

        let percentualB = 0;


        if (total > 0) {

            percentualA =
                salarioA / total;

            percentualB =
                salarioB / total;

        }


        /* -----------------------------------------------
           APORTE DA CASA
        ------------------------------------------------ */

        const aporteA =
            casa * percentualA;


        const aporteB =
            casa * percentualB;


        /* -----------------------------------------------
           SOBRA INDIVIDUAL
        ------------------------------------------------ */

        const sobraA =
            salarioA -
            aporteA -
            verbaA;


        const sobraB =
            salarioB -
            aporteB -
            verbaB;


        /* -----------------------------------------------
           DISPONÍVEL TOTAL
        ------------------------------------------------ */

        const restante =
            total -
            casa -
            investimento -
            verbaA -
            verbaB;


        /* -----------------------------------------------
           RESUMO
        ------------------------------------------------ */

        rendaTotal.textContent =
            moeda(total);


        custoCasaResumo.textContent =
            moeda(casa);


        investimentosResumo.textContent =
            moeda(investimento);


        restanteResumo.textContent =
            moeda(
                Math.max(
                    0,
                    restante
                )
            );


        /* -----------------------------------------------
           PERCENTUAIS
        ------------------------------------------------ */

        percentual1.textContent =
            `${(
                percentualA * 100
            ).toFixed(1)}%`;


        percentual2.textContent =
            `${(
                percentualB * 100
            ).toFixed(1)}%`;


        aportePercentual1.textContent =
            `${(
                percentualA * 100
            ).toFixed(1)}%`;


        aportePercentual2.textContent =
            `${(
                percentualB * 100
            ).toFixed(1)}%`;


        /* -----------------------------------------------
           APORTES
        ------------------------------------------------ */

        aporte1.textContent =
            moeda(aporteA);


        aporte2.textContent =
            moeda(aporteB);


        /* -----------------------------------------------
           SOBRAS
        ------------------------------------------------ */

        sobra1.textContent =
            moeda(
                Math.max(
                    0,
                    sobraA
                )
            );


        sobra2.textContent =
            moeda(
                Math.max(
                    0,
                    sobraB
                )
            );


        /* -----------------------------------------------
           BARRAS
        ------------------------------------------------ */

        barraAporte1.style.width =
            `${percentualA * 100}%`;


        barraAporte2.style.width =
            `${percentualB * 100}%`;


        /* -----------------------------------------------
           SALVAR NO SUPABASE
        ------------------------------------------------ */

        programarSalvamento();

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    const campos = [

        salario1,
        salario2,
        custoCasa,
        investimentos,
        verba1,
        verba2

    ];


    campos.forEach(
        function (campo) {

            campo.addEventListener(
                "input",
                atualizarFinanceiro
            );

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    const casalCarregado =
        await carregarCasal();


    if (!casalCarregado) {

        return;

    }


    await carregarSalarios();


    atualizarFinanceiro();

});