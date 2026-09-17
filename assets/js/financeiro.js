document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CHAVES DE ARMAZENAMENTO
    ====================================================== */

    const PERFIL_KEY =
        "financasCasal_perfil";


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
       PERFIL CENTRAL
    ====================================================== */

    function carregarPerfil() {

        const dados =
            localStorage.getItem(
                PERFIL_KEY
            );


        if (!dados) {

            return {

                salario1: 0,
                salario2: 0

            };

        }


        try {

            const perfil =
                JSON.parse(dados);


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

        } catch (erro) {

            console.error(
                "Erro ao carregar perfil:",
                erro
            );


            return {

                salario1: 0,
                salario2: 0

            };

        }

    }


    function salvarPerfil() {

        const perfil = {

            salario1:
                Number(
                    salario1.value
                ) || 0,

            salario2:
                Number(
                    salario2.value
                ) || 0

        };


        localStorage.setItem(
            PERFIL_KEY,
            JSON.stringify(perfil)
        );

    }


    /* =====================================================
       CARREGAR SALÁRIOS SALVOS
    ====================================================== */

    function carregarSalarios() {

        const perfil =
            carregarPerfil();


        salario1.value =
            perfil.salario1;


        salario2.value =
            perfil.salario2;

    }


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
           SALVAR DADOS CENTRAIS
        ------------------------------------------------ */

        salvarPerfil();

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    const campos =
        [
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

    carregarSalarios();

    atualizarFinanceiro();

});