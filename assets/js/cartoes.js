document.addEventListener("DOMContentLoaded", async function () {


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


    /* =====================================================
       RESUMOS
    ====================================================== */

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
       CONFIGURAÇÃO
    ====================================================== */

    const CARTOES_KEY =
        "financasCasal_cartoes";

    const COMPRAS_KEY =
        "financasCasal_compras";

    const MIGRACAO_KEY =
        "financasCasal_cartoes_migrado";


    let cartoes = [];

    let compras = [];

    let casalId = null;


    /* =====================================================
       FUNÇÕES BÁSICAS
    ====================================================== */

    function moeda(numero) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(
            Number(numero) || 0
        );

    }


    function escaparHTML(valorTexto) {

        return String(
            valorTexto ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    function criarIdLocal() {

        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
        );

    }


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
            ).padStart(
                2,
                "0"
            );


        const dia =
            String(
                agora.getDate()
            ).padStart(
                2,
                "0"
            );


        return `${ano}-${mes}-${dia}`;

    }


    function formatarData(texto) {

        if (!texto) {

            return "-";

        }


        const partes =
            texto.split("-");


        if (
            partes.length !== 3
        ) {

            return texto;

        }


        return `${partes[2]}/${partes[1]}/${partes[0]}`;

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
                ).padStart(
                    2,
                    "0"
                );


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
            dataAtual().slice(
                0,
                7
            );

    }


    /* =====================================================
       LOCALSTORAGE — LEITURA DOS DADOS ANTIGOS
    ====================================================== */

    function carregarLocal(chave) {

        const dados =
            localStorage.getItem(
                chave
            );


        if (!dados) {

            return [];

        }


        try {

            const resultado =
                JSON.parse(dados);


            return Array.isArray(
                resultado
            )
                ? resultado
                : [];

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar dados locais:",
                chave,
                erro
            );

            return [];

        }

    }


    /* =====================================================
       IDENTIFICAR USUÁRIO E CASAL
    ====================================================== */

    async function carregarCasal() {

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();


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

            return false;

        }


        console.log(
            "👤 Usuário:",
            user.email
        );


        const {
            data: membro,
            error: membroError
        } = await supabaseClient
            .from("membros")
            .select("casal_id")
            .eq(
                "id",
                user.id
            )
            .single();


        if (
            membroError ||
            !membro
        ) {

            console.error(
                "❌ Não foi possível localizar o casal:",
                membroError
            );

            return false;

        }


        casalId =
            membro.casal_id;


        console.log(
            "✅ Casal identificado:",
            casalId
        );


        return true;

    }


    /* =====================================================
       CARREGAR CARTÕES
    ====================================================== */

    async function carregarCartoesSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("cartoes")
            .select("*")
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar cartões:",
                error
            );

            return false;

        }


        cartoes =
            data || [];


        console.log(
            `✅ ${cartoes.length} cartão(ões) carregado(s) do Supabase.`
        );


        return true;

    }


    /* =====================================================
       CARREGAR COMPRAS
    ====================================================== */

    async function carregarComprasSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("compras_cartao")
            .select("*")
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "data_compra",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar compras:",
                error
            );

            return false;

        }


        compras =
            (data || []).map(
                function (compra) {

                    return {

                        id:
                            compra.id,

                        casalId:
                            compra.casal_id,

                        cartaoId:
                            compra.cartao_id,

                        descricao:
                            compra.descricao,

                        valorTotal:
                            Number(
                                compra.valor_total
                            ) || 0,

                        data:
                            compra.data_compra,

                        parcelas:
                            Number(
                                compra.parcelas
                            ) || 1,

                        categoria:
                            compra.categoria,

                        responsavel:
                            compra.responsavel

                    };

                }
            );


        console.log(
            `✅ ${compras.length} compra(s) carregada(s) do Supabase.`
        );


        return true;

    }


    /* =====================================================
       MIGRAÇÃO DE CARTÕES E COMPRAS
    ====================================================== */

    async function migrarDadosAntigos() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (
            jaMigrado === "true"
        ) {

            return;

        }


        const cartoesLocais =
            carregarLocal(
                CARTOES_KEY
            );


        const comprasLocais =
            carregarLocal(
                COMPRAS_KEY
            );


        if (
            cartoesLocais.length === 0 &&
            comprasLocais.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        /* =================================================
           VERIFICAR DADOS JÁ EXISTENTES NO BANCO
        ================================================== */

        const {
            count: quantidadeCartoesBanco,
            error: erroCartoes
        } = await supabaseClient
            .from("cartoes")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "casal_id",
                casalId
            );


        if (erroCartoes) {

            console.error(
                "❌ Erro ao verificar cartões existentes:",
                erroCartoes
            );

            return;

        }


        const {
            count: quantidadeComprasBanco,
            error: erroCompras
        } = await supabaseClient
            .from("compras_cartao")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "casal_id",
                casalId
            );


        if (erroCompras) {

            console.error(
                "❌ Erro ao verificar compras existentes:",
                erroCompras
            );

            return;

        }


        if (
            Number(
                quantidadeCartoesBanco
            ) > 0 ||
            Number(
                quantidadeComprasBanco
            ) > 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ O Supabase já possui dados de cartões. Migração automática não executada."
            );

            return;

        }


        console.log(
            "📦 Iniciando migração de cartões e compras..."
        );


        /* =================================================
           MAPA DE CARTÕES ANTIGOS → NOVOS
        ================================================== */

        const mapaCartoes =
            new Map();


        /* =================================================
           MIGRAR CARTÕES
        ================================================== */

        for (
            const cartao of cartoesLocais
        ) {

            const dadosCartao = {

                casal_id:
                    casalId,

                nome:
                    String(
                        cartao.nome || ""
                    ).trim(),

                banco:
                    String(
                        cartao.banco || ""
                    ).trim(),

                limite:
                    Number(
                        cartao.limite
                    ) || 0,

                fechamento:
                    Number(
                        cartao.fechamento
                    ) || 1,

                vencimento:
                    Number(
                        cartao.vencimento
                    ) || 1,

                titular:
                    cartao.titular ||
                    "Casal"

            };


            if (
                !dadosCartao.nome ||
                dadosCartao.limite <= 0
            ) {

                continue;

            }


            const {
                data: cartaoInserido,
                error
            } = await supabaseClient
                .from("cartoes")
                .insert(
                    dadosCartao
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao migrar cartão:",
                    cartao,
                    error
                );

                continue;

            }


            mapaCartoes.set(
                cartao.id,
                cartaoInserido.id
            );

        }


        /* =================================================
           MIGRAR COMPRAS
        ================================================== */

        const comprasParaInserir =
            comprasLocais
                .map(
                    function (compra) {

                        const novoCartaoId =
                            mapaCartoes.get(
                                compra.cartaoId
                            );


                        if (
                            !novoCartaoId
                        ) {

                            return null;

                        }


                        return {

                            casal_id:
                                casalId,

                            cartao_id:
                                novoCartaoId,

                            descricao:
                                String(
                                    compra.descricao || ""
                                ).trim(),

                            valor_total:
                                Number(
                                    compra.valorTotal
                                ) || 0,

                            data_compra:
                                compra.data,

                            parcelas:
                                Number(
                                    compra.parcelas
                                ) || 1,

                            categoria:
                                compra.categoria ||
                                "Outros",

                            responsavel:
                                compra.responsavel ||
                                "Casal"

                        };

                    }
                )
                .filter(
                    function (compra) {

                        return (
                            compra &&
                            compra.descricao &&
                            compra.valor_total > 0 &&
                            compra.data_compra &&
                            compra.cartao_id
                        );

                    }
                );


        if (
            comprasParaInserir.length > 0
        ) {

            const {
                error:
                    erroComprasInsercao
            } = await supabaseClient
                .from("compras_cartao")
                .insert(
                    comprasParaInserir
                );


            if (
                erroComprasInsercao
            ) {

                console.error(
                    "❌ Erro ao migrar compras:",
                    erroComprasInsercao
                );

                return;

            }

        }


        localStorage.setItem(
            MIGRACAO_KEY,
            "true"
        );


        console.log(
            `✅ Migração concluída: ${mapaCartoes.size} cartão(ões) e ${comprasParaInserir.length} compra(s).`
        );

    }


    /* =====================================================
       SELECT DE CARTÕES
    ====================================================== */

    function atualizarSelectCartoes() {

        cartaoCompra.innerHTML =
            "";


        if (
            cartoes.length === 0
        ) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "Primeiro cadastre um cartão";


            cartaoCompra.appendChild(
                option
            );


            return;

        }


        cartoes.forEach(
            function (cartao) {

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

            }
        );

    }


    /* =====================================================
       COMPRAS DO CARTÃO
    ====================================================== */

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
            Number(
                compra.parcelas
            );


        if (
            !quantidade ||
            quantidade < 1
        ) {

            return [];

        }


        const valorParcela =
            Number(
                compra.valorTotal
            ) /
            quantidade;


        const resultado = [];


        const dataInicial =
            new Date(
                `${compra.data}T00:00:00`
            );


        if (
            Number.isNaN(
                dataInicial.getTime()
            )
        ) {

            return [];

        }


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
                ).padStart(
                    2,
                    "0"
                );


            resultado.push({

                id:
                    criarIdLocal(),

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
       PARCELAS DO MÊS
    ====================================================== */

    function parcelasDoMes(
        mes
    ) {

        const resultado = [];


        compras.forEach(
            function (compra) {

                const parcelasGeradas =
                    gerarParcelas(
                        compra
                    );


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
       MESES FUTUROS
    ====================================================== */

    function mesesFuturos() {

        const mesAtual =
            dataAtual().slice(
                0,
                7
            );


        let total = 0;


        compras.forEach(
            function (compra) {

                gerarParcelas(
                    compra
                ).forEach(
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
            function (
                soma,
                parcela
            ) {

                return (
                    soma +
                    Number(
                        parcela.valor
                    )
                );

            },
            0
        );

    }


    /* =====================================================
       TOTAL COMPROMETIDO
    ====================================================== */

    function totalComprometido() {

        return compras.reduce(
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

    }


    /* =====================================================
       RENDERIZA CARTÕES
    ====================================================== */

    function renderizarCartoes() {

        cardsGrid.innerHTML =
            "";


        if (
            cartoes.length === 0
        ) {

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
                    Number(
                        cartao.limite
                    ) > 0
                        ? (
                            comprometido /
                            Number(
                                cartao.limite
                            )
                        ) * 100
                        : 0;


                const disponivel =
                    Math.max(
                        0,
                        Number(
                            cartao.limite
                        ) -
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
                        data-id="${escaparHTML(
                            cartao.id
                        )}"
                        title="Excluir cartão"
                    >
                        ×
                    </button>

                    <div class="credit-card-top">

                        <div>

                            <div class="credit-card-name">
                                ${escaparHTML(
                                    cartao.nome
                                )}
                            </div>

                            <div class="credit-card-bank">
                                ${escaparHTML(
                                    cartao.banco ||
                                    "Cartão"
                                )}
                            </div>

                        </div>

                        <div class="credit-card-owner">
                            ${escaparHTML(
                                cartao.titular
                            )}
                        </div>

                    </div>


                    <div class="credit-card-limit">

                        <div>

                            <span class="credit-card-label">
                                LIMITE
                            </span>

                            <span class="credit-card-value">
                                ${moeda(
                                    cartao.limite
                                )}
                            </span>

                        </div>


                        <div>

                            <span class="credit-card-label">
                                DISPONÍVEL
                            </span>

                            <span class="credit-card-value">
                                ${moeda(
                                    disponivel
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="credit-card-progress">

                        <div class="credit-card-progress-bar">

                            <span
                                style="width: ${Math.min(
                                    percentual,
                                    100
                                )}%;"
                            ></span>

                        </div>


                        <div class="credit-card-progress-info">

                            <span>
                                ${percentual.toFixed(1)}% comprometido
                            </span>

                            <span>
                                Fecha dia ${escaparHTML(
                                    cartao.fechamento
                                )}
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

        const limiteTotalCalculado =
            cartoes.reduce(
                function (
                    soma,
                    cartao
                ) {

                    return (
                        soma +
                        Number(
                            cartao.limite
                        )
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
                limiteTotalCalculado -
                comprometido
            );


        limiteTotal.textContent =
            moeda(
                limiteTotalCalculado
            );


        faturaMes.textContent =
            moeda(
                fatura
            );


        parcelasFuturas.textContent =
            moeda(
                mesesFuturos()
            );


        limiteDisponivel.textContent =
            moeda(
                disponivel
            );


        invoiceTotal.textContent =
            moeda(
                fatura
            );


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
            !quantidade ||
            quantidade < 1
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
                ${quantidade}x de ${moeda(
                    parcela
                )}
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
            parcelasDoMes(
                mes
            );


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
                            ${escaparHTML(
                                compra.descricao
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(
                            cartao?.nome ||
                            "—"
                        )}
                    </td>

                    <td>
                        ${escaparHTML(
                            compra.categoria
                        )}
                    </td>

                    <td>

                        <span class="installment-badge">
                            ${parcela.parcelaNumero}/${parcela.parcelaTotal}
                        </span>

                    </td>

                    <td>
                        ${escaparHTML(
                            compra.responsavel
                        )}
                    </td>

                    <td class="value-cell">
                        ${moeda(
                            parcela.valor
                        )}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${escaparHTML(
                                compra.id
                            )}"
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


    /* =====================================================
       ATUALIZAR TELA
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
        async function (evento) {

            evento.preventDefault();


            const novoCartao = {

                casal_id:
                    casalId,

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
                !novoCartao.vencimento ||
                !novoCartao.titular
            ) {

                alert(
                    "Preencha corretamente os dados do cartão."
                );

                return;

            }


            const botao =
                cartaoForm.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Salvando...";

            }


            const {
                data: cartaoInserido,
                error
            } = await supabaseClient
                .from("cartoes")
                .insert(
                    novoCartao
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar cartão:",
                    error
                );


                alert(
                    "Não foi possível salvar o cartão."
                );


                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar";

                }


                return;

            }


            cartoes.push(
                cartaoInserido
            );


            console.log(
                "✅ Cartão salvo no Supabase:",
                cartaoInserido
            );


            cartaoForm.reset();


            atualizarTela();


            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       REGISTRAR COMPRA
    ====================================================== */

    compraForm.addEventListener(
        "submit",
        async function (evento) {

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

                casal_id:
                    casalId,

                cartao_id:
                    cartaoCompra.value,

                descricao:
                    descricaoCompra.value.trim(),

                valor_total:
                    Number(
                        valorCompra.value
                    ),

                data_compra:
                    dataCompra.value,

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
                novaCompra.valor_total <= 0 ||
                !novaCompra.data_compra ||
                !novaCompra.cartao_id ||
                !novaCompra.parcelas ||
                novaCompra.parcelas < 1 ||
                !novaCompra.categoria ||
                !novaCompra.responsavel
            ) {

                alert(
                    "Preencha corretamente os dados da compra."
                );

                return;

            }


            const botao =
                compraForm.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Salvando...";

            }


            const {
                data: compraInserida,
                error
            } = await supabaseClient
                .from("compras_cartao")
                .insert(
                    novaCompra
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar compra:",
                    error
                );


                alert(
                    "Não foi possível salvar a compra."
                );


                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar";

                }


                return;

            }


            compras.unshift({

                id:
                    compraInserida.id,

                casalId:
                    compraInserida.casal_id,

                cartaoId:
                    compraInserida.cartao_id,

                descricao:
                    compraInserida.descricao,

                valorTotal:
                    Number(
                        compraInserida.valor_total
                    ) || 0,

                data:
                    compraInserida.data_compra,

                parcelas:
                    Number(
                        compraInserida.parcelas
                    ) || 1,

                categoria:
                    compraInserida.categoria,

                responsavel:
                    compraInserida.responsavel

            });


            console.log(
                "✅ Compra salva no Supabase:",
                compraInserida
            );


            compraForm.reset();


            dataCompra.value =
                dataAtual();


            atualizarTela();


            if (botao) {

                botao.disabled =
                    false;

                botao.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       EXCLUIR CARTÃO
    ====================================================== */

    cardsGrid.addEventListener(
        "click",
        async function (evento) {

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


            if (
                possuiCompras
            ) {

                alert(
                    "Este cartão possui compras registradas. Exclua as compras antes de remover o cartão."
                );

                return;

            }


            const confirmar =
                confirm(
                    "Deseja excluir este cartão?"
                );


            if (
                !confirmar
            ) {

                return;

            }


            botao.disabled =
                true;


            const {
                error
            } = await supabaseClient
                .from("cartoes")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "casal_id",
                    casalId
                );


            if (error) {

                console.error(
                    "❌ Erro ao excluir cartão:",
                    error
                );


                alert(
                    "Não foi possível excluir o cartão."
                );


                botao.disabled =
                    false;

                return;

            }


            cartoes =
                cartoes.filter(
                    function (cartao) {

                        return (
                            cartao.id !==
                            id
                        );

                    }
                );


            atualizarTela();


            console.log(
                "✅ Cartão excluído."
            );

        }
    );


    /* =====================================================
       EXCLUIR COMPRA
    ====================================================== */

    invoiceList.addEventListener(
        "click",
        async function (evento) {

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


            if (
                !confirmar
            ) {

                return;

            }


            botao.disabled =
                true;


            const {
                error
            } = await supabaseClient
                .from("compras_cartao")
                .delete()
                .eq(
                    "id",
                    id
                )
                .eq(
                    "casal_id",
                    casalId
                );


            if (error) {

                console.error(
                    "❌ Erro ao excluir compra:",
                    error
                );


                alert(
                    "Não foi possível excluir a compra."
                );


                botao.disabled =
                    false;

                return;

            }


            compras =
                compras.filter(
                    function (compra) {

                        return (
                            compra.id !==
                            id
                        );

                    }
                );


            atualizarTela();


            console.log(
                "✅ Compra excluída."
            );

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


    /* =====================================================
       IDENTIFICAR CASAL
    ====================================================== */

    const casalCarregado =
        await carregarCasal();


    if (
        !casalCarregado
    ) {

        return;

    }


    /* =====================================================
       MIGRAÇÃO
    ====================================================== */

    await migrarDadosAntigos();


    /* =====================================================
       CARREGAR CARTÕES
    ====================================================== */

    const carregouCartoes =
        await carregarCartoesSupabase();


    if (
        !carregouCartoes
    ) {

        return;

    }


    /* =====================================================
       CARREGAR COMPRAS
    ====================================================== */

    const carregouCompras =
        await carregarComprasSupabase();


    if (
        !carregouCompras
    ) {

        return;

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    atualizarTela();


});