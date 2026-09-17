document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const form =
        document.getElementById("despesaForm");

    const mesFiltro =
        document.getElementById("mesFiltro");

    const descricao =
        document.getElementById("descricao");

    const valor =
        document.getElementById("valor");

    const data =
        document.getElementById("data");

    const categoria =
        document.getElementById("categoria");

    const tipo =
        document.getElementById("tipo");

    const pagador =
        document.getElementById("pagador");

    const status =
        document.getElementById("status");


    const listaDespesas =
        document.getElementById("listaDespesas");

    const emptyTable =
        document.getElementById("emptyTable");


    const totalMes =
        document.getElementById("totalMes");

    const totalFixas =
        document.getElementById("totalFixas");

    const totalVariaveis =
        document.getElementById("totalVariaveis");

    const totalInvestimentos =
        document.getElementById("totalInvestimentos");

    const categoriasResumo =
        document.getElementById("categoriasResumo");

    const quantidadeDespesas =
        document.getElementById("quantidadeDespesas");


    /* =====================================================
       STORAGE
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_despesas";


    let despesas =
        carregarDespesas();


    /* =====================================================
       FUNÇÕES
    ====================================================== */

    function carregarDespesas() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {
            return [];
        }


        try {

            return JSON.parse(dados);

        } catch (erro) {

            console.error(
                "Erro ao carregar despesas:",
                erro
            );

            return [];

        }

    }


    function salvarDespesas() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(despesas)
        );

    }


    function moeda(valorNumerico) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(valorNumerico);

    }


    function formatarData(dataTexto) {

        if (!dataTexto) {
            return "-";
        }


        const partes =
            dataTexto.split("-");


        if (partes.length !== 3) {
            return dataTexto;
        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    function criarId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
        );

    }


    /* =====================================================
       FILTRO DO MÊS
    ====================================================== */

    function despesasDoMes() {

        const mes =
            mesFiltro.value;


        return despesas.filter(function (despesa) {

            return despesa.data.startsWith(
                mes
            );

        });

    }


    /* =====================================================
       ATUALIZA TOTAIS
    ====================================================== */

    function atualizarResumo() {

        const registros =
            despesasDoMes();


        let total = 0;
        let fixas = 0;
        let variaveis = 0;
        let investimentos = 0;


        registros.forEach(function (despesa) {

            const valorDespesa =
                Number(despesa.valor);


            total += valorDespesa;


            if (
                despesa.tipo === "Fixa"
            ) {

                fixas += valorDespesa;

            }


            if (
                despesa.tipo === "Variável"
            ) {

                variaveis += valorDespesa;

            }


            if (
                despesa.tipo === "Investimento"
            ) {

                investimentos +=
                    valorDespesa;

            }

        });


        totalMes.textContent =
            moeda(total);

        totalFixas.textContent =
            moeda(fixas);

        totalVariaveis.textContent =
            moeda(variaveis);

        totalInvestimentos.textContent =
            moeda(investimentos);


        quantidadeDespesas.textContent =
            `${registros.length} ${
                registros.length === 1
                    ? "registro"
                    : "registros"
            }`;

    }


    /* =====================================================
       RESUMO POR CATEGORIA
    ====================================================== */

    function atualizarCategorias() {

        const registros =
            despesasDoMes();


        const categorias = {};


        registros.forEach(function (despesa) {

            if (
                !categorias[despesa.categoria]
            ) {

                categorias[
                    despesa.categoria
                ] = 0;

            }


            categorias[
                despesa.categoria
            ] += Number(despesa.valor);

        });


        const entradas =
            Object.entries(categorias);


        if (entradas.length === 0) {

            categoriasResumo.innerHTML = `

                <div class="empty-state">

                    <span>
                        Nenhuma despesa registrada.
                    </span>

                </div>

            `;

            return;

        }


        entradas.sort(function (a, b) {

            return b[1] - a[1];

        });


        const total =
            entradas.reduce(
                function (soma, item) {

                    return soma + item[1];

                },
                0
            );


        categoriasResumo.innerHTML =
            "";


        entradas.forEach(function (item) {

            const nome =
                item[0];

            const valorCategoria =
                item[1];

            const percentual =
                total > 0
                    ? (
                        valorCategoria /
                        total
                    ) * 100
                    : 0;


            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "category-summary-item";


            elemento.innerHTML = `

                <div class="category-summary-header">

                    <span>
                        ${nome}
                    </span>

                    <strong>
                        ${moeda(valorCategoria)}
                    </strong>

                </div>

                <div class="category-bar">

                    <span
                        style="width: ${percentual}%"
                    ></span>

                </div>

                <span class="category-percent">
                    ${percentual.toFixed(1)}% das despesas
                </span>

            `;


            categoriasResumo.appendChild(
                elemento
            );

        });

    }


    /* =====================================================
       BADGES
    ====================================================== */

    function classeTipo(tipoDespesa) {

        if (
            tipoDespesa === "Fixa"
        ) {

            return "badge badge-fixed";

        }


        if (
            tipoDespesa === "Investimento"
        ) {

            return "badge badge-investment";

        }


        return "badge badge-variable";

    }


    function classeStatus(statusDespesa) {

        if (
            statusDespesa === "Pago"
        ) {

            return "badge badge-paid";

        }


        return "badge badge-pending";

    }


    /* =====================================================
       RENDERIZA TABELA
    ====================================================== */

    function renderizarDespesas() {

        const registros =
            despesasDoMes();


        listaDespesas.innerHTML =
            "";


        if (registros.length === 0) {

            emptyTable.style.display =
                "block";

            return;

        }


        emptyTable.style.display =
            "none";


        registros.sort(function (a, b) {

            return (
                new Date(b.data) -
                new Date(a.data)
            );

        });


        registros.forEach(function (despesa) {

            const linha =
                document.createElement(
                    "tr"
                );


            linha.innerHTML = `

                <td>
                    ${formatarData(despesa.data)}
                </td>

                <td>
                    <strong>
                        ${despesa.descricao}
                    </strong>
                </td>

                <td>
                    ${despesa.categoria}
                </td>

                <td>

                    <span class="${classeTipo(despesa.tipo)}">
                        ${despesa.tipo}
                    </span>

                </td>

                <td>
                    ${despesa.pagador}
                </td>

                <td>

                    <span class="${classeStatus(despesa.status)}">
                        ${despesa.status}
                    </span>

                </td>

                <td class="value-cell">
                    ${moeda(Number(despesa.valor))}
                </td>

                <td>

                    <button
                        class="delete-button"
                        data-id="${despesa.id}"
                        title="Excluir despesa"
                    >
                        ×
                    </button>

                </td>

            `;


            listaDespesas.appendChild(
                linha
            );

        });

    }


    /* =====================================================
       ATUALIZA TUDO
    ====================================================== */

    function atualizarTela() {

        atualizarResumo();

        atualizarCategorias();

        renderizarDespesas();

    }


    /* =====================================================
       ADICIONAR
    ====================================================== */

    form.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const novaDespesa = {

                id: criarId(),

                descricao:
                    descricao.value.trim(),

                valor:
                    Number(valor.value),

                data:
                    data.value,

                categoria:
                    categoria.value,

                tipo:
                    tipo.value,

                pagador:
                    pagador.value,

                status:
                    status.value

            };


            if (
                !novaDespesa.descricao ||
                !novaDespesa.valor ||
                !novaDespesa.data ||
                !novaDespesa.categoria ||
                !novaDespesa.tipo ||
                !novaDespesa.pagador
            ) {

                alert(
                    "Preencha todos os campos obrigatórios."
                );

                return;

            }


            despesas.push(
                novaDespesa
            );


            salvarDespesas();

            atualizarTela();


            form.reset();


            /* Recoloca o mês atual */

            data.value =
                dataAtual();

        }
    );


    /* =====================================================
       EXCLUIR
    ====================================================== */

    listaDespesas.addEventListener(
        "click",
        function (evento) {

            const botao =
                evento.target.closest(
                    ".delete-button"
                );


            if (!botao) {
                return;
            }


            const id =
                botao.dataset.id;


            const confirmar =
                confirm(
                    "Deseja excluir esta despesa?"
                );


            if (!confirmar) {
                return;
            }


            despesas =
                despesas.filter(
                    function (despesa) {

                        return (
                            despesa.id !== id
                        );

                    }
                );


            salvarDespesas();

            atualizarTela();

        }
    );


    /* =====================================================
       ALTERAR MÊS
    ====================================================== */

    mesFiltro.addEventListener(
        "change",
        atualizarTela
    );


    /* =====================================================
       DATA ATUAL
    ====================================================== */

    function dataAtual() {

        const agora =
            new Date();


        const ano =
            agora.getFullYear();


        const mes =
            String(
                agora.getMonth() + 1
            ).padStart(2, "0");


        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    data.value =
        dataAtual();


    mesFiltro.value =
        dataAtual().slice(0, 7);


    atualizarTela();


});