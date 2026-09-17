document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const cartaoForm =
        document.getElementById("cartaoForm");

    const compraForm =
        document.getElementById("compraForm");


    const nomeCartao =
        document.getElementById("nomeCartao");

    const banco =
        document.getElementById("banco");

    const limite =
        document.getElementById("limite");

    const fechamento =
        document.getElementById("fechamento");

    const vencimento =
        document.getElementById("vencimento");

    const titular =
        document.getElementById("titular");


    const descricaoCompra =
        document.getElementById("descricaoCompra");

    const valorCompra =
        document.getElementById("valorCompra");

    const dataCompra =
        document.getElementById("dataCompra");

    const cartaoCompra =
        document.getElementById("cartaoCompra");

    const parcelas =
        document.getElementById("parcelas");

    const categoriaCompra =
        document.getElementById("categoriaCompra");

    const responsavelCompra =
        document.getElementById("responsavelCompra");


    const cardsGrid =
        document.getElementById("cardsGrid");


    const invoiceList =
        document.getElementById("invoiceList");

    const emptyInvoice =
        document.getElementById("emptyInvoice");


    const mesFiltro =
        document.getElementById("mesFiltro");


    const installmentPreview =
        document.getElementById(
            "installmentPreview"
        );


    /* RESUMOS */

    const limiteTotal =
        document.getElementById("limiteTotal");

    const faturaMes =
        document.getElementById("faturaMes");

    const parcelasFuturas =
        document.getElementById(
            "parcelasFuturas"
        );

    const limiteDisponivel =
        document.getElementById(
            "limiteDisponivel"
        );

    const invoiceTotal =
        document.getElementById(
            "invoiceTotal"
        );

    const invoiceTitle =
        document.getElementById(
            "invoiceTitle"
        );


    /* =====================================================
       STORAGE
    ====================================================== */

    const CARTOES_KEY =
        "financasCasal_cartoes";

    const COMPRAS_KEY =
        "financasCasal_compras";


    let cartoes =
        carregar(CARTOES_KEY);

    let compras =
        carregar(COMPRAS_KEY);


    /* =====================================================
       FUNÇÕES BÁSICAS
    ====================================================== */

    function carregar(chave) {

        const dados =
            localStorage.getItem(chave);


        if (!dados) {
            return [];
        }


        try {

            return JSON.parse(dados);

        } catch (erro) {

            console.error(
                "Erro ao carregar dados:",
                erro
            );

            return [];

        }

    }


    function salvar(
        chave,
        dados
    ) {

        localStorage.setItem(
            chave,
            JSON.stringify(dados)
        );

    }


    function moeda(numero) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(numero);

    }


    function criarId() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
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
            ).padStart(2, "0");


        const dia =
            String(
                agora.getDate()
            ).padStart(2, "0");


        return `${ano}-${mes}-${dia}`;

    }


    /* =====================================================
       MESES
    ====================================================== */

    function montarMeses() {

        const agora =
            new Date();


        mesFiltro.innerHTML =
            "";


        for (
            let i = -1;
            i <= 12;
            i++
        ) {

            const data =
                new Date(
                    agora.getFullYear(),
                    agora.getMonth() + i,
                    1
                );


            const ano =
                data.getFullYear();


            const mes =
                String(
                    data.getMonth() + 1
                ).padStart(2, "0");


            const valorMes =
                `${ano}-${mes}`;


            const texto =
                data.toLocaleDateString(
                    "pt-BR",
                    {
                        month: "long",
                        year: "numeric"
                    }
                );


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                valorMes;

            option.textContent =
                texto.charAt(0).toUpperCase() +
                texto.slice(1);


            mesFiltro.appendChild(
                option
            );

        }


        mesFiltro.value =
            dataAtual().slice(0, 7);

    }


    /* =====================================================
       CARTÕES
    ====================================================== */

    function atualizarSelectCartoes() {

        cartaoCompra.innerHTML =
            "";


        if (cartoes.length === 0) {

            const option =
                document.createElement(
                    "option"
                );


            option.value = "";

            option.textContent =
                "Primeiro cadastre um cartão";


            cartaoCompra.appendChild(
                option
            );


            return;

        }


        cartoes.forEach(function (cartao) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                cartao.id;

            option.textContent =
                cartao.nome;


            cartaoCompra.appendChild(
                option
            );

        });

    }


    function comprasDoCartao(
        cartaoId
    ) {

        return compras.filter(
            function (compra) {

                return (
                    compra.cartaoId ===
                    cartaoId
                );

            }
        );

    }


    /* =====================================================
       PARCELAS
    ====================================================== */

    function gerarParcelas(
        compra
    ) {

        const quantidade =
            Number(compra.parcelas);


        const valorParcela =
            compra.valorTotal /
            quantidade;


        const resultado = [];


        const dataInicial =
            new Date(
                `${compra.data}T00:00:00`
            );


        for (
            let i = 0;
            i < quantidade;
            i++
        ) {

            const data =
                new Date(
                    dataInicial
                );


            data.setMonth(
                data.getMonth() + i
            );


            const ano =
                data.getFullYear();


            const mes =
                String(
                    data.getMonth() + 1
                ).padStart(2, "0");


            resultado.push({

                id:
                    criarId(),

                compraId:
                    compra.id,

                cartaoId:
                    compra.cartaoId,

                data:
                    `${ano}-${mes}`,

                dataOriginal:
                    compra.data,

                parcelaNumero:
                    i + 1,

                parcelaTotal:
                    quantidade,

                valor:
                    valorParcela

            });

        }


        return resultado;

    }


    /* =====================================================
       TOTAL FATURA
    ====================================================== */

    function parcelasDoMes(
        mes
    ) {

        const resultado = [];


        compras.forEach(
            function (compra) {

                const parcelasGeradas =
                    gerarParcelas(compra);


                parcelasGeradas.forEach(
                    function (parcela) {

                        if (
                            parcela.data ===
                            mes
                        ) {

                            resultado.push(
                                parcela
                            );

                        }

                    }
                );

            }
        );


        return resultado;

    }


    /* =====================================================
       MÊS FUTURO
    ====================================================== */

    function mesesFuturos() {

        const mesAtual =
            dataAtual().slice(0, 7);


        let total = 0;


        compras.forEach(
            function (compra) {

                gerarParcelas(compra)
                    .forEach(
                        function (parcela) {

                            if (
                                parcela.data >
                                mesAtual
                            ) {

                                total +=
                                    Number(
                                        parcela.valor
                                    );

                            }

                        }
                    );

            }
        );


        return total;

    }


    /* =====================================================
       FATURA ATUAL
    ====================================================== */

    function totalFaturaAtual() {

        const parcelasMes =
            parcelasDoMes(
                mesFiltro.value
            );


        return parcelasMes.reduce(
            function (soma, parcela) {

                return (
                    soma +
                    Number(parcela.valor)
                );

            },
            0
        );

    }


    /* =====================================================
       TOTAL JÁ COMPROMETIDO DO LIMITE
    ====================================================== */

    function totalComprometido() {

        return compras.reduce(
            function (soma, compra) {

                return (
                    soma +
                    Number(
                        compra.valorTotal
                    )
                );

            },
            0
        );

    }


    /* =====================================================
       RENDERIZA CARTÕES
    ====================================================== */

    function renderizarCartoes() {

        cardsGrid.innerHTML =
            "";


        if (cartoes.length === 0) {

            cardsGrid.innerHTML = `

                <div class="empty-card-state">

                    Nenhum cartão cadastrado.

                </div>

            `;

            return;

        }


        cartoes.forEach(
            function (cartao) {

                const comprasCartao =
                    comprasDoCartao(
                        cartao.id
                    );


                const comprometido =
                    comprasCartao.reduce(
                        function (
                            soma,
                            compra
                        ) {

                            return (
                                soma +
                                Number(
                                    compra.valorTotal
                                )
                            );

                        },
                        0
                    );


                const percentual =
                    cartao.limite > 0
                        ? (
                            comprometido /
                            cartao.limite
                        ) * 100
                        : 0;


                const disponivel =
                    Math.max(
                        0,
                        cartao.limite -
                        comprometido
                    );


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "credit-card";


                card.innerHTML = `

                    <button
                        class="card-delete"
                        data-id="${cartao.id}"
                        title="Excluir cartão"
                    >
                        ×
                    </button>

                    <div class="credit-card-top">

                        <div>

                            <div class="credit-card-name">
                                ${cartao.nome}
                            </div>

                            <div class="credit-card-bank">
                                ${cartao.banco || "Cartão"}
                            </div>

                        </div>

                        <div class="credit-card-owner">
                            ${cartao.titular}
                        </div>

                    </div>


                    <div class="credit-card-limit">

                        <div>

                            <span class="credit-card-label">
                                LIMITE
                            </span>

                            <span class="credit-card-value">
                                ${moeda(cartao.limite)}
                            </span>

                        </div>


                        <div>

                            <span class="credit-card-label">
                                DISPONÍVEL
                            </span>

                            <span class="credit-card-value">
                                ${moeda(disponivel)}
                            </span>

                        </div>

                    </div>


                    <div class="credit-card-progress">

                        <div class="credit-card-progress-bar">

                            <span
                                style="width: ${Math.min(percentual, 100)}%;"
                            ></span>

                        </div>


                        <div class="credit-card-progress-info">

                            <span>
                                ${percentual.toFixed(1)}% comprometido
                            </span>

                            <span>
                                Fecha dia ${cartao.fechamento}
                            </span>

                        </div>

                    </div>

                `;


                cardsGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const limite =
            cartoes.reduce(
                function (soma, cartao) {

                    return (
                        soma +
                        Number(cartao.limite)
                    );

                },
                0
            );


        const fatura =
            totalFaturaAtual();


        const comprometido =
            totalComprometido();


        const disponivel =
            Math.max(
                0,
                limite -
                comprometido
            );


        limiteTotal.textContent =
            moeda(limite);


        faturaMes.textContent =
            moeda(fatura);


        parcelasFuturas.textContent =
            moeda(mesesFuturos());


        limiteDisponivel.textContent =
            moeda(disponivel);


        invoiceTotal.textContent =
            moeda(fatura);


        invoiceTitle.textContent =
            `Fatura de ${
                mesFiltro.options[
                    mesFiltro.selectedIndex
                ]?.text || ""
            }`;

    }


    /* =====================================================
       PREVIEW PARCELAMENTO
    ====================================================== */

    function atualizarPreview() {

        const valor =
            Number(
                valorCompra.value
            );


        const quantidade =
            Number(
                parcelas.value
            );


        if (
            !valor ||
            valor <= 0 ||
            !quantidade
        ) {

            installmentPreview.textContent =
                "Selecione os valores para visualizar o parcelamento.";

            return;

        }


        const parcela =
            valor /
            quantidade;


        installmentPreview.innerHTML = `

            <strong>
                ${quantidade}x de ${moeda(parcela)}
            </strong>

            <br>

            Total da compra:
            ${moeda(valor)}

        `;

    }


    /* =====================================================
       FATURA
    ====================================================== */

    function renderizarFatura() {

        const mes =
            mesFiltro.value;


        const parcelasMes =
            parcelasDoMes(mes);


        invoiceList.innerHTML =
            "";


        if (
            parcelasMes.length === 0
        ) {

            emptyInvoice.style.display =
                "block";

            return;

        }


        emptyInvoice.style.display =
            "none";


        parcelasMes.sort(
            function (a, b) {

                return (
                    a.dataOriginal.localeCompare(
                        b.dataOriginal
                    )
                );

            }
        );


        parcelasMes.forEach(
            function (parcela) {

                const compra =
                    compras.find(
                        function (item) {

                            return (
                                item.id ===
                                parcela.compraId
                            );

                        }
                    );


                if (!compra) {
                    return;
                }


                const cartao =
                    cartoes.find(
                        function (item) {

                            return (
                                item.id ===
                                parcela.cartaoId
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
                            compra.data
                        )}
                    </td>

                    <td>
                        <strong>
                            ${compra.descricao}
                        </strong>
                    </td>

                    <td>
                        ${cartao?.nome || "—"}
                    </td>

                    <td>
                        ${compra.categoria}
                    </td>

                    <td>

                        <span class="installment-badge">
                            ${parcela.parcelaNumero}/${parcela.parcelaTotal}
                        </span>

                    </td>

                    <td>
                        ${compra.responsavel}
                    </td>

                    <td class="value-cell">
                        ${moeda(
                            parcela.valor
                        )}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${compra.id}"
                            title="Excluir compra"
                        >
                            ×
                        </button>

                    </td>

                `;


                invoiceList.appendChild(
                    linha
                );

            }
        );

    }


    function formatarData(
        texto
    ) {

        const partes =
            texto.split("-");


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    /* =====================================================
       ATUALIZAR TUDO
    ====================================================== */

    function atualizarTela() {

        atualizarSelectCartoes();

        renderizarCartoes();

        atualizarResumo();

        renderizarFatura();

        atualizarPreview();

    }


    /* =====================================================
       CADASTRAR CARTÃO
    ====================================================== */

    cartaoForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const novoCartao = {

                id:
                    criarId(),

                nome:
                    nomeCartao.value.trim(),

                banco:
                    banco.value.trim(),

                limite:
                    Number(
                        limite.value
                    ),

                fechamento:
                    Number(
                        fechamento.value
                    ),

                vencimento:
                    Number(
                        vencimento.value
                    ),

                titular:
                    titular.value

            };


            if (
                !novoCartao.nome ||
                novoCartao.limite <= 0 ||
                !novoCartao.fechamento ||
                !novoCartao.vencimento
            ) {

                alert(
                    "Preencha corretamente os dados do cartão."
                );

                return;

            }


            cartoes.push(
                novoCartao
            );


            salvar(
                CARTOES_KEY,
                cartoes
            );


            cartaoForm.reset();


            atualizarTela();

        }
    );


    /* =====================================================
       REGISTRAR COMPRA
    ====================================================== */

    compraForm.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            if (
                cartoes.length === 0
            ) {

                alert(
                    "Cadastre um cartão antes de registrar uma compra."
                );

                return;

            }


            const novaCompra = {

                id:
                    criarId(),

                descricao:
                    descricaoCompra.value.trim(),

                valorTotal:
                    Number(
                        valorCompra.value
                    ),

                data:
                    dataCompra.value,

                cartaoId:
                    cartaoCompra.value,

                parcelas:
                    Number(
                        parcelas.value
                    ),

                categoria:
                    categoriaCompra.value,

                responsavel:
                    responsavelCompra.value

            };


            if (
                !novaCompra.descricao ||
                novaCompra.valorTotal <= 0 ||
                !novaCompra.data ||
                !novaCompra.cartaoId ||
                !novaCompra.categoria
            ) {

                alert(
                    "Preencha corretamente os dados da compra."
                );

                return;

            }


            compras.push(
                novaCompra
            );


            salvar(
                COMPRAS_KEY,
                compras
            );


            compraForm.reset();


            dataCompra.value =
                dataAtual();


            atualizarTela();

        }
    );


    /* =====================================================
       EXCLUIR
    ====================================================== */

    cardsGrid.addEventListener(
        "click",
        function (evento) {

            const botao =
                evento.target.closest(
                    ".card-delete"
                );


            if (!botao) {
                return;
            }


            const id =
                botao.dataset.id;


            const possuiCompras =
                compras.some(
                    function (compra) {

                        return (
                            compra.cartaoId ===
                            id
                        );

                    }
                );


            if (possuiCompras) {

                alert(
                    "Este cartão possui compras registradas. Exclua as compras antes de remover o cartão."
                );

                return;

            }


            const confirmar =
                confirm(
                    "Deseja excluir este cartão?"
                );


            if (!confirmar) {
                return;
            }


            cartoes =
                cartoes.filter(
                    function (cartao) {

                        return (
                            cartao.id !== id
                        );

                    }
                );


            salvar(
                CARTOES_KEY,
                cartoes
            );


            atualizarTela();

        }
    );


    invoiceList.addEventListener(
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
                    "Deseja excluir esta compra e todas as suas parcelas?"
                );


            if (!confirmar) {
                return;
            }


            compras =
                compras.filter(
                    function (compra) {

                        return (
                            compra.id !== id
                        );

                    }
                );


            salvar(
                COMPRAS_KEY,
                compras
            );


            atualizarTela();

        }
    );


    /* =====================================================
       EVENTOS
    ====================================================== */

    valorCompra.addEventListener(
        "input",
        atualizarPreview
    );


    parcelas.addEventListener(
        "change",
        atualizarPreview
    );


    mesFiltro.addEventListener(
        "change",
        atualizarTela
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    montarMeses();


    dataCompra.value =
        dataAtual();


    atualizarTela();

});