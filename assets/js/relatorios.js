document.addEventListener(
    "DOMContentLoaded",
    async function () {


    /* =====================================================
       REFERÊNCIAS
    ====================================================== */

    const relatorioMes =
        document.getElementById(
            "relatorioMes"
        );

    const btnAtualizarRelatorio =
        document.getElementById(
            "btnAtualizarRelatorio"
        );

    const relatorioStatus =
        document.getElementById(
            "relatorioStatus"
        );


    /* =====================================================
       FUNÇÕES GERAIS
    ====================================================== */

    function moeda(valor) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(
            Number(valor) || 0
        );

    }


    function percentual(
        valor,
        total
    ) {

        if (
            Number(total) <= 0
        ) {

            return 0;

        }


        return (
            Number(valor) /
            Number(total)
        ) * 100;

    }


    function escaparHTML(
        valor
    ) {

        return String(
            valor ?? ""
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


    function formatarData(
        data
    ) {

        if (!data) {

            return "—";

        }


        const partes =
            String(data).split("-");


        if (
            partes.length !== 3
        ) {

            return String(data);

        }


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
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


        return (
            `${ano}-${mes}-${dia}`
        );

    }


    function nomeMes(
        numero
    ) {

        const meses = [

            "Janeiro",
            "Fevereiro",
            "Março",
            "Abril",
            "Maio",
            "Junho",
            "Julho",
            "Agosto",
            "Setembro",
            "Outubro",
            "Novembro",
            "Dezembro"

        ];


        return (
            meses[
                Number(numero) - 1
            ] || ""
        );

    }


    function nomeMesCurto(
        numero
    ) {

        const meses = [

            "JAN",
            "FEV",
            "MAR",
            "ABR",
            "MAI",
            "JUN",
            "JUL",
            "AGO",
            "SET",
            "OUT",
            "NOV",
            "DEZ"

        ];


        return (
            meses[
                Number(numero) - 1
            ] || ""
        );

    }


    function exibirErro(
        mensagem
    ) {

        if (
            relatorioStatus
        ) {

            relatorioStatus.textContent =
                mensagem;

            relatorioStatus.classList.add(
                "visible"
            );

        }

    }


    function limparErro() {

        if (
            relatorioStatus
        ) {

            relatorioStatus.textContent =
                "";

            relatorioStatus.classList.remove(
                "visible"
            );

        }

    }


    /* =====================================================
       MÊS PADRÃO
    ====================================================== */

    const mesAtualSistema =
        dataAtual().slice(
            0,
            7
        );


    if (
        relatorioMes &&
        !relatorioMes.value
    ) {

        relatorioMes.value =
            mesAtualSistema;

    }


    /* =====================================================
       ESTADO
    ====================================================== */

    let dados = {

        perfil: null,

        despesas: [],

        contas: [],

        compras: [],

        investimentos: [],

        metas: [],

        membros: []

    };


    let usuarioAtual =
        null;


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
        "👤 Usuário do relatório:",
        usuarioAtual.email
    );


    /* =====================================================
       IDENTIFICAR CASAL
    ====================================================== */

    const {
        data: membro,
        error: membroError
    } = await supabaseClient
        .from("membros")
        .select(
            "casal_id"
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
            "❌ Não foi possível identificar o casal:",
            membroError
        );

        exibirErro(
            "Não foi possível identificar o casal."
        );

        return;

    }


    const casalId =
        membro.casal_id;


    console.log(
        "✅ Casal identificado:",
        casalId
    );


    /* =====================================================
       CARREGAR DADOS
    ====================================================== */

    async function carregarDados() {

        limparErro();


        console.log(
            "📡 Carregando dados do relatório..."
        );


        const [

            perfilResultado,

            despesasResultado,

            contasResultado,

            comprasResultado,

            investimentosResultado,

            metasResultado,

            membrosResultado

        ] = await Promise.all([


            supabaseClient
                .from("perfil_financeiro")
                .select(
                    "salario1, salario2"
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .single(),


            supabaseClient
                .from("despesas")
                .select(
                    `
                    id,
                    descricao,
                    valor,
                    data,
                    categoria,
                    tipo,
                    pagador,
                    status
                    `
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .order(
                    "data",
                    {
                        ascending: true
                    }
                ),


            supabaseClient
                .from("contas")
                .select(
                    `
                    id,
                    descricao,
                    valor,
                    vencimento,
                    categoria,
                    tipo,
                    responsavel,
                    status
                    `
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .order(
                    "vencimento",
                    {
                        ascending: true
                    }
                ),


            supabaseClient
                .from("compras_cartao")
                .select(
                    `
                    id,
                    cartao_id,
                    descricao,
                    valor_total,
                    data_compra,
                    parcelas,
                    categoria,
                    responsavel
                    `
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .order(
                    "data_compra",
                    {
                        ascending: true
                    }
                ),


            supabaseClient
                .from("investimentos")
                .select(
                    `
                    id,
                    meta_id,
                    valor,
                    data,
                    tipo,
                    responsavel,
                    observacao
                    `
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .order(
                    "data",
                    {
                        ascending: true
                    }
                ),


            supabaseClient
                .from("metas")
                .select(
                    `
                    id,
                    nome,
                    tipo,
                    responsavel,
                    objetivo,
                    atual,
                    aporte_mensal,
                    prazo,
                    descricao
                    `
                )
                .eq(
                    "casal_id",
                    casalId
                )
                .order(
                    "nome",
                    {
                        ascending: true
                    }
                ),


            supabaseClient
                .from("membros")
                .select(
                    `
                    id,
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


        /* =================================================
           VALIDAR RESULTADOS
        ================================================== */

        if (
            perfilResultado.error
        ) {

            throw new Error(
                `Erro no perfil financeiro: ${perfilResultado.error.message}`
            );

        }


        if (
            despesasResultado.error
        ) {

            throw new Error(
                `Erro nas despesas: ${despesasResultado.error.message}`
            );

        }


        if (
            contasResultado.error
        ) {

            throw new Error(
                `Erro nas contas: ${contasResultado.error.message}`
            );

        }


        if (
            comprasResultado.error
        ) {

            throw new Error(
                `Erro nas compras de cartão: ${comprasResultado.error.message}`
            );

        }


        if (
            investimentosResultado.error
        ) {

            throw new Error(
                `Erro nos investimentos: ${investimentosResultado.error.message}`
            );

        }


        if (
            metasResultado.error
        ) {

            throw new Error(
                `Erro nas metas: ${metasResultado.error.message}`
            );

        }


        if (
            membrosResultado.error
        ) {

            throw new Error(
                `Erro nos membros: ${membrosResultado.error.message}`
            );

        }


        /* =================================================
           ARMAZENAR
        ================================================== */

        dados.perfil =
            perfilResultado.data;


        dados.despesas =
            despesasResultado.data ||
            [];


        dados.contas =
            contasResultado.data ||
            [];


        dados.compras =
            comprasResultado.data ||
            [];


        dados.investimentos =
            investimentosResultado.data ||
            [];


        dados.metas =
            metasResultado.data ||
            [];


        dados.membros =
            membrosResultado.data ||
            [];


        console.log(
            "✅ Dados carregados:",
            {
                despesas:
                    dados.despesas.length,

                contas:
                    dados.contas.length,

                compras:
                    dados.compras.length,

                investimentos:
                    dados.investimentos.length,

                metas:
                    dados.metas.length,

                membros:
                    dados.membros.length
            }
        );

    }


    /* =====================================================
       RESPONSÁVEL
    ====================================================== */

    function nomeResponsavel(
        valor
    ) {

        if (
            !valor
        ) {

            return "Não informado";

        }


        const texto =
            String(valor).trim();


        const outrosMembros =
            dados.membros.filter(
                function (item) {

                    return (
                        item.id !==
                        usuarioAtual.id
                    );

                }
            );


        /* ---------------------------------------------
           CASAL
        --------------------------------------------- */

        if (
            texto.toLowerCase() ===
            "casal"
        ) {

            return "Casal";

        }


        /* ---------------------------------------------
           VOCÊ
        --------------------------------------------- */

        if (
            texto.toLowerCase() ===
            "você"
        ) {

            const membroAtual =
                dados.membros.find(
                    function (item) {

                        return (
                            item.id ===
                            usuarioAtual.id
                        );

                    }
                );


            return (
                membroAtual?.nome_exibicao ||
                "Você"
            );

        }


        /* ---------------------------------------------
           SUA ESPOSA
        --------------------------------------------- */

        if (
            texto.toLowerCase() ===
            "sua esposa"
        ) {

            return (
                outrosMembros[0]?.nome_exibicao ||
                "Sua esposa"
            );

        }


        /* ---------------------------------------------
           NOME JÁ CADASTRADO
        --------------------------------------------- */

        const membroEncontrado =
            dados.membros.find(
                function (item) {

                    return (
                        item.nome_exibicao
                            ?.toLowerCase() ===
                        texto.toLowerCase()
                    );

                }
            );


        if (
            membroEncontrado
        ) {

            return membroEncontrado.nome_exibicao;

        }


        return texto;

    }


    /* =====================================================
       PARCELAS DE CARTÃO
    ====================================================== */

    function gerarParcelas(
        compra
    ) {

        const resultado =
            [];


        const quantidade =
            Number(
                compra.parcelas
            ) || 1;


        const valorTotal =
            Number(
                compra.valor_total
            ) || 0;


        if (
            !compra.data_compra ||
            valorTotal <= 0
        ) {

            return resultado;

        }


        const dataInicial =
            new Date(
                `${compra.data_compra}T00:00:00`
            );


        if (
            Number.isNaN(
                dataInicial.getTime()
            )
        ) {

            return resultado;

        }


        const valorParcela =
            quantidade > 0
                ? valorTotal /
                  quantidade
                : valorTotal;


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
                data.getMonth() +
                i
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

                mes:
                    `${ano}-${mes}`,

                valor:
                    valorParcela,

                numero:
                    i + 1,

                total:
                    quantidade

            });

        }


        return resultado;

    }


    /* =====================================================
       CALCULAR DADOS DO PERÍODO
    ====================================================== */

    function calcularRelatorio(
        mesSelecionado
    ) {

        /* ---------------------------------------------
           RENDA
        --------------------------------------------- */

        const salario1 =
            Number(
                dados.perfil?.salario1
            ) || 0;


        const salario2 =
            Number(
                dados.perfil?.salario2
            ) || 0;


        const rendaTotal =
            salario1 +
            salario2;


        /* ---------------------------------------------
           DESPESAS
        --------------------------------------------- */

        const despesasMes =
            dados.despesas.filter(
                function (despesa) {

                    return (
                        despesa.data &&
                        despesa.data.startsWith(
                            mesSelecionado
                        ) &&
                        despesa.tipo !==
                        "Investimento"
                    );

                }
            );


        const totalDespesas =
            despesasMes.reduce(
                function (
                    soma,
                    despesa
                ) {

                    return (
                        soma +
                        (
                            Number(
                                despesa.valor
                            ) || 0
                        )
                    );

                },
                0
            );


        const gastosPessoais =
            despesasMes
                .filter(
                    function (
                        despesa
                    ) {

                        return (
                            despesa.categoria ===
                            "Pessoal"
                        );

                    }
                )
                .reduce(
                    function (
                        soma,
                        despesa
                    ) {

                        return (
                            soma +
                            (
                                Number(
                                    despesa.valor
                                ) || 0
                            )
                        );

                    },
                    0
                );


        const despesasCasa =
            Math.max(
                0,
                totalDespesas -
                gastosPessoais
            );


        /* ---------------------------------------------
           INVESTIMENTOS
        --------------------------------------------- */

        const investimentosMes =
            dados.investimentos.filter(
                function (
                    investimento
                ) {

                    return (
                        investimento.data &&
                        investimento.data.startsWith(
                            mesSelecionado
                        )
                    );

                }
            );


        const totalInvestimentos =
            investimentosMes.reduce(
                function (
                    soma,
                    investimento
                ) {

                    return (
                        soma +
                        (
                            Number(
                                investimento.valor
                            ) || 0
                        )
                    );

                },
                0
            );


        /* ---------------------------------------------
           CONTAS
        --------------------------------------------- */

        const contasMes =
            dados.contas.filter(
                function (
                    conta
                ) {

                    return (
                        conta.vencimento &&
                        conta.vencimento.startsWith(
                            mesSelecionado
                        )
                    );

                }
            );


        const contasPendentes =
            contasMes.filter(
                function (
                    conta
                ) {

                    return (
                        String(
                            conta.status ||
                            ""
                        ).toLowerCase() !==
                        "pago"
                    );

                }
            );


        const totalContasPendentes =
            contasPendentes.reduce(
                function (
                    soma,
                    conta
                ) {

                    return (
                        soma +
                        (
                            Number(
                                conta.valor
                            ) || 0
                        )
                    );

                },
                0
            );


        /* ---------------------------------------------
           CARTÕES
        --------------------------------------------- */

        const comprasComParcela =
            [];


        let faturaCartao =
            0;


        dados.compras.forEach(
            function (
                compra
            ) {

                const parcelas =
                    gerarParcelas(
                        compra
                    );


                parcelas.forEach(
                    function (
                        parcela
                    ) {

                        if (
                            parcela.mes ===
                            mesSelecionado
                        ) {

                            faturaCartao +=
                                Number(
                                    parcela.valor
                                ) || 0;


                            comprasComParcela.push({

                                compra:
                                    compra,

                                parcela:
                                    parcela

                            });

                        }

                    }
                );

            }
        );


        /* ---------------------------------------------
           DISPONÍVEL
        --------------------------------------------- */

        const disponivel =
            Math.max(
                0,
                rendaTotal -
                totalDespesas -
                totalInvestimentos -
                totalContasPendentes -
                faturaCartao
            );


        return {

            mes:
                mesSelecionado,

            rendaTotal:

                rendaTotal,

            despesasMes:

                despesasMes,

            totalDespesas:

                totalDespesas,

            gastosPessoais:

                gastosPessoais,

            despesasCasa:

                despesasCasa,

            investimentosMes:

                investimentosMes,

            totalInvestimentos:

                totalInvestimentos,

            contasMes:

                contasMes,

            contasPendentes:

                contasPendentes,

            totalContasPendentes:

                totalContasPendentes,

            comprasComParcela:

                comprasComParcela,

            faturaCartao:

                faturaCartao,

            disponivel:

                disponivel

        };

    }


    /* =====================================================
       ATUALIZAR RESUMO
    ====================================================== */

    function atualizarResumo(
        relatorio
    ) {

        const renda =
            document.getElementById(
                "relRenda"
            );


        const despesas =
            document.getElementById(
                "relDespesas"
            );


        const despesasPercentual =
            document.getElementById(
                "relDespesasPercentual"
            );


        const investimentos =
            document.getElementById(
                "relInvestimentos"
            );


        const investimentosPercentual =
            document.getElementById(
                "relInvestimentosPercentual"
            );


        const contasPendentes =
            document.getElementById(
                "relContasPendentes"
            );


        const contasQuantidade =
            document.getElementById(
                "relContasQuantidade"
            );


        const fatura =
            document.getElementById(
                "relFatura"
            );


        const disponivel =
            document.getElementById(
                "relDisponivel"
            );


        if (renda) {

            renda.textContent =
                moeda(
                    relatorio.rendaTotal
                );

        }


        if (despesas) {

            despesas.textContent =
                moeda(
                    relatorio.totalDespesas
                );

        }


        if (despesasPercentual) {

            despesasPercentual.textContent =
                `${percentual(
                    relatorio.totalDespesas,
                    relatorio.rendaTotal
                ).toFixed(1)}% da renda`;

        }


        if (investimentos) {

            investimentos.textContent =
                moeda(
                    relatorio.totalInvestimentos
                );

        }


        if (
            investimentosPercentual
        ) {

            investimentosPercentual.textContent =
                `${percentual(
                    relatorio.totalInvestimentos,
                    relatorio.rendaTotal
                ).toFixed(1)}% da renda`;

        }


        if (
            contasPendentes
        ) {

            contasPendentes.textContent =
                moeda(
                    relatorio.totalContasPendentes
                );

        }


        if (
            contasQuantidade
        ) {

            const quantidade =
                relatorio
                    .contasPendentes
                    .length;


            contasQuantidade.textContent =
                `${quantidade} ${
                    quantidade === 1
                        ? "conta"
                        : "contas"
                }`;

        }


        if (fatura) {

            fatura.textContent =
                moeda(
                    relatorio.faturaCartao
                );

        }


        if (disponivel) {

            disponivel.textContent =
                moeda(
                    relatorio.disponivel
                );

        }


        const distribuicaoTotal =
            document.getElementById(
                "relDistribuicaoTotal"
            );


        if (
            distribuicaoTotal
        ) {

            distribuicaoTotal.textContent =
                moeda(
                    relatorio.rendaTotal
                );

        }

    }


    /* =====================================================
       ATUALIZAR DISTRIBUIÇÃO
    ====================================================== */

    function atualizarDistribuicaoItem(
        valor,
        total,
        valorId,
        percentualId,
        barraId
    ) {

        const valorElemento =
            document.getElementById(
                valorId
            );


        const percentualElemento =
            document.getElementById(
                percentualId
            );


        const barra =
            document.getElementById(
                barraId
            );


        const p =
            percentual(
                valor,
                total
            );


        if (
            valorElemento
        ) {

            valorElemento.textContent =
                moeda(
                    valor
                );

        }


        if (
            percentualElemento
        ) {

            percentualElemento.textContent =
                `${p.toFixed(1)}%`;

        }


        if (barra) {

            barra.style.width =
                `${Math.min(
                    100,
                    Math.max(
                        0,
                        p
                    )
                )}%`;

        }

    }


    function atualizarDistribuicao(
        relatorio
    ) {

        atualizarDistribuicaoItem(
            relatorio.despesasCasa,
            relatorio.rendaTotal,
            "relCasaValor",
            "relCasaPercentual",
            "relCasaBar"
        );


        atualizarDistribuicaoItem(
            relatorio.gastosPessoais,
            relatorio.rendaTotal,
            "relPessoalValor",
            "relPessoalPercentual",
            "relPessoalBar"
        );


        atualizarDistribuicaoItem(
            relatorio.totalInvestimentos,
            relatorio.rendaTotal,
            "relInvestValor",
            "relInvestPercentual",
            "relInvestBar"
        );


        atualizarDistribuicaoItem(
            relatorio.totalContasPendentes,
            relatorio.rendaTotal,
            "relContasValor",
            "relContasPercentual",
            "relContasBar"
        );

    }


    /* =====================================================
       CATEGORIAS
    ====================================================== */

    function renderizarCategorias(
        relatorio
    ) {

        const container =
            document.getElementById(
                "relCategorias"
            );


        if (!container) {

            return;

        }


        const categorias =
            {};


        relatorio
            .despesasMes
            .forEach(
                function (
                    despesa
                ) {

                    const categoria =
                        despesa.categoria ||
                        "Outros";


                    if (
                        !categorias[
                            categoria
                        ]
                    ) {

                        categorias[
                            categoria
                        ] = 0;

                    }


                    categorias[
                        categoria
                    ] +=
                        Number(
                            despesa.valor
                        ) || 0;

                }
            );


        const lista =
            Object.entries(
                categorias
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1] -
                            a[1]
                        );

                    }
                );


        container.innerHTML =
            "";


        if (
            lista.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-report-state">

                    Nenhuma despesa registrada
                    no período selecionado.

                </div>

            `;

            return;

        }


        const total =
            lista.reduce(
                function (
                    soma,
                    item
                ) {

                    return (
                        soma +
                        item[1]
                    );

                },
                0
            );


        lista.forEach(
            function (
                item
            ) {

                const nome =
                    item[0];


                const valor =
                    item[1];


                const p =
                    percentual(
                        valor,
                        total
                    );


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "report-category-item";


                elemento.innerHTML = `

                    <div class="report-category-top">

                        <span>
                            ${escaparHTML(
                                nome
                            )}
                        </span>

                        <strong>
                            ${moeda(
                                valor
                            )}
                        </strong>

                    </div>


                    <div class="report-category-bar">

                        <span
                            style="width: ${Math.min(
                                100,
                                p
                            )}%;"
                        ></span>

                    </div>

                `;


                container.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       PESSOAS
    ====================================================== */

    function renderizarPessoas(
        relatorio
    ) {

        const container =
            document.getElementById(
                "relPessoas"
            );


        if (!container) {

            return;

        }


        const pessoas =
            {};


        relatorio
            .despesasMes
            .forEach(
                function (
                    despesa
                ) {

                    const nome =
                        nomeResponsavel(
                            despesa.pagador
                        );


                    if (
                        !pessoas[nome]
                    ) {

                        pessoas[nome] = 0;

                    }


                    pessoas[nome] +=
                        Number(
                            despesa.valor
                        ) || 0;

                }
            );


        const lista =
            Object.entries(
                pessoas
            )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            b[1] -
                            a[1]
                        );

                    }
                );


        container.innerHTML =
            "";


        if (
            lista.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-report-state">

                    Nenhuma despesa registrada
                    no período selecionado.

                </div>

            `;

            return;

        }


        const total =
            lista.reduce(
                function (
                    soma,
                    item
                ) {

                    return (
                        soma +
                        item[1]
                    );

                },
                0
            );


        lista.forEach(
            function (
                item
            ) {

                const nome =
                    item[0];


                const valor =
                    item[1];


                const p =
                    percentual(
                        valor,
                        total
                    );


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "report-person-item";


                elemento.innerHTML = `

                    <div class="report-person-header">

                        <strong>
                            ${escaparHTML(
                                nome
                            )}
                        </strong>

                        <span>
                            ${moeda(
                                valor
                            )}
                        </span>

                    </div>


                    <div class="report-person-bar">

                        <span
                            style="width: ${Math.min(
                                100,
                                p
                            )}%;"
                        ></span>

                    </div>

                `;


                container.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       INVESTIMENTOS
    ====================================================== */

    function renderizarInvestimentos(
        relatorio
    ) {

        const container =
            document.getElementById(
                "relInvestimentosLista"
            );


        const totalElemento =
            document.getElementById(
                "relInvestimentosTotal"
            );


        if (totalElemento) {

            totalElemento.textContent =
                moeda(
                    relatorio.totalInvestimentos
                );

        }


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            relatorio
                .investimentosMes
                .length === 0
        ) {

            container.innerHTML = `

                <div class="empty-report-state">

                    Nenhum investimento
                    realizado no período.

                </div>

            `;

            return;

        }


        relatorio
            .investimentosMes
            .forEach(
                function (
                    investimento
                ) {

                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "report-investment-item";


                    const responsavel =
                        nomeResponsavel(
                            investimento.responsavel
                        );


                    const tipo =
                        investimento.tipo ||
                        "Investimento";


                    const observacao =
                        investimento.observacao ||
                        "";


                    elemento.innerHTML = `

                        <div class="report-investment-main">

                            <strong>
                                ${escaparHTML(
                                    tipo
                                )}
                            </strong>

                            <span>
                                ${escaparHTML(
                                    responsavel
                                )}
                                ${
                                    observacao
                                        ? " • " +
                                          escaparHTML(
                                              observacao
                                          )
                                        : ""
                                }
                            </span>

                        </div>


                        <strong class="report-investment-value">

                            ${moeda(
                                investimento.valor
                            )}

                        </strong>

                    `;


                    container.appendChild(
                        elemento
                    );

                }
            );

    }


    /* =====================================================
       CONTAS
    ====================================================== */

    function renderizarContas(
        relatorio
    ) {

        const container =
            document.getElementById(
                "relContasLista"
            );


        const totalElemento =
            document.getElementById(
                "relContasTotal"
            );


        if (totalElemento) {

            totalElemento.textContent =
                moeda(
                    relatorio.totalContasPendentes
                );

        }


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            relatorio
                .contasPendentes
                .length === 0
        ) {

            container.innerHTML = `

                <div class="empty-report-state">

                    Nenhuma conta pendente
                    no período.

                </div>

            `;

            return;

        }


        relatorio
            .contasPendentes
            .slice(
                0,
                8
            )
            .forEach(
                function (
                    conta
                ) {

                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "report-bill-item";


                    const responsavel =
                        nomeResponsavel(
                            conta.responsavel
                        );


                    const partes =
                        String(
                            conta.vencimento
                        )
                            .split("-");


                    let dataTexto =
                        formatarData(
                            conta.vencimento
                        );


                    if (
                        partes.length === 3
                    ) {

                        dataTexto =
                            `${partes[2]}/${partes[1]}`;

                    }


                    elemento.innerHTML = `

                        <div class="report-bill-main">

                            <strong>

                                <span
                                    class="report-bill-date"
                                >
                                    ${escaparHTML(
                                        dataTexto
                                    )}
                                </span>

                                ${escaparHTML(
                                    conta.descricao
                                )}

                            </strong>

                            <span>
                                ${escaparHTML(
                                    conta.categoria ||
                                    "Sem categoria"
                                )}
                                ${
                                    responsavel
                                        ? " • " +
                                          escaparHTML(
                                              responsavel
                                          )
                                        : ""
                                }
                            </span>

                        </div>


                        <strong class="report-bill-value">

                            ${moeda(
                                conta.valor
                            )}

                        </strong>

                    `;


                    container.appendChild(
                        elemento
                    );

                }
            );

    }


    /* =====================================================
       CARTÕES
    ====================================================== */

    function renderizarCartoes(
        relatorio
    ) {

        const tabela =
            document.getElementById(
                "relCartoesTabela"
            );


        const totalElemento =
            document.getElementById(
                "relCartoesTotal"
            );


        if (totalElemento) {

            totalElemento.textContent =
                moeda(
                    relatorio.faturaCartao
                );

        }


        if (!tabela) {

            return;

        }


        tabela.innerHTML =
            "";


        if (
            relatorio
                .comprasComParcela
                .length === 0
        ) {

            tabela.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="empty-report-table"
                    >

                        Nenhuma compra de cartão
                        compõe a fatura deste período.

                    </td>

                </tr>

            `;

            return;

        }


        relatorio
            .comprasComParcela
            .sort(
                function (
                    a,
                    b
                ) {

                    return (
                        b.parcela.valor -
                        a.parcela.valor
                    );

                }
            )
            .forEach(
                function (
                    registro
                ) {

                    const compra =
                        registro.compra;


                    const parcela =
                        registro.parcela;


                    const elemento =
                        document.createElement(
                            "tr"
                        );


                    const responsavel =
                        nomeResponsavel(
                            compra.responsavel
                        );


                    elemento.innerHTML = `

                        <td class="table-main">

                            ${escaparHTML(
                                compra.descricao
                            )}

                        </td>


                        <td class="table-secondary">

                            ${formatarData(
                                compra.data_compra
                            )}

                        </td>


                        <td>

                            ${parcela.numero}/${
                                parcela.total
                            }

                        </td>


                        <td>

                            ${escaparHTML(
                                compra.categoria ||
                                "—"
                            )}

                        </td>


                        <td>

                            ${escaparHTML(
                                responsavel
                            )}

                        </td>


                        <td class="table-value">

                            ${moeda(
                                parcela.valor
                            )}

                        </td>

                    `;


                    tabela.appendChild(
                        elemento
                    );

                }
            );

    }


    /* =====================================================
       METAS
    ====================================================== */

    function renderizarMetas() {

        const container =
            document.getElementById(
                "relMetas"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        if (
            dados.metas.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-report-state">

                    Nenhuma meta cadastrada.

                </div>

            `;

            return;

        }


        const metasOrdenadas =
            [...dados.metas]
                .sort(
                    function (
                        a,
                        b
                    ) {

                        const objetivoA =
                            Number(
                                a.objetivo
                            );


                        const atualA =
                            Number(
                                a.atual
                            );


                        const objetivoB =
                            Number(
                                b.objetivo
                            );


                        const atualB =
                            Number(
                                b.atual
                            );


                        const pA =
                            objetivoA > 0
                                ? atualA /
                                  objetivoA
                                : 0;


                        const pB =
                            objetivoB > 0
                                ? atualB /
                                  objetivoB
                                : 0;


                        return (
                            pA -
                            pB
                        );

                    }
                );


        metasOrdenadas
            .forEach(
                function (
                    meta
                ) {

                    const objetivo =
                        Number(
                            meta.objetivo
                        ) || 0;


                    const atual =
                        Number(
                            meta.atual
                        ) || 0;


                    const p =
                        objetivo > 0
                            ? Math.min(
                                100,
                                (
                                    atual /
                                    objetivo
                                ) * 100
                            )
                            : 0;


                    const faltante =
                        Math.max(
                            0,
                            objetivo -
                            atual
                        );


                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "report-goal-item";


                    elemento.innerHTML = `

                        <div class="report-goal-header">

                            <div>

                                <strong>
                                    ${escaparHTML(
                                        meta.nome
                                    )}
                                </strong>

                                <span>
                                    ${escaparHTML(
                                        meta.tipo ||
                                        "Meta"
                                    )}
                                    ${
                                        meta.responsavel
                                            ? " • " +
                                              escaparHTML(
                                                  meta.responsavel
                                              )
                                            : ""
                                    }
                                </span>

                            </div>


                            <strong
                                class="report-goal-percent"
                            >
                                ${p.toFixed(1)}%
                            </strong>

                        </div>


                        <div class="report-goal-bar">

                            <span
                                style="width: ${p}%;"
                            ></span>

                        </div>


                        <div class="report-goal-footer">

                            <span>
                                ${moeda(atual)}
                                de
                                ${moeda(objetivo)}
                            </span>

                            <strong>
                                ${
                                    faltante > 0
                                        ? "Falta " +
                                          moeda(
                                              faltante
                                          )
                                        : "Objetivo alcançado"
                                }
                            </strong>

                        </div>

                    `;


                    container.appendChild(
                        elemento
                    );

                }
            );

    }


    /* =====================================================
       CABEÇALHO / STATUS
    ====================================================== */

    function atualizarCabecalho(
        mesSelecionado
    ) {

        const partes =
            mesSelecionado.split("-");


        const ano =
            partes[0];


        const mes =
            partes[1];


        const dataAtualElemento =
            document.getElementById(
                "relatorioDataAtual"
            );


        if (
            dataAtualElemento
        ) {

            dataAtualElemento.textContent =
                `${nomeMes(
                    mes
                )} ${ano}`;

        }


        if (
            relatorioStatus
        ) {

            relatorioStatus.textContent =
                `Relatório de ${nomeMes(
                    mes
                )} de ${ano} atualizado.`;


            relatorioStatus.classList.remove(
                "visible"
            );

        }

    }


    /* =====================================================
       RENDERIZAR TUDO
    ====================================================== */

    function renderizar(
        mesSelecionado
    ) {

        if (
            !mesSelecionado
        ) {

            mesSelecionado =
                mesAtualSistema;

        }


        const relatorio =
            calcularRelatorio(
                mesSelecionado
            );


        atualizarCabecalho(
            mesSelecionado
        );


        atualizarResumo(
            relatorio
        );


        atualizarDistribuicao(
            relatorio
        );


        renderizarCategorias(
            relatorio
        );


        renderizarPessoas(
            relatorio
        );


        renderizarInvestimentos(
            relatorio
        );


        renderizarContas(
            relatorio
        );


        renderizarCartoes(
            relatorio
        );


        renderizarMetas();


        console.log(
            "📊 Relatório renderizado:",
            {
                mes:
                    mesSelecionado,

                renda:
                    relatorio.rendaTotal,

                despesas:
                    relatorio.totalDespesas,

                investimentos:
                    relatorio.totalInvestimentos,

                contasPendentes:
                    relatorio.totalContasPendentes,

                fatura:
                    relatorio.faturaCartao,

                disponivel:
                    relatorio.disponivel
            }
        );

    }


    /* =====================================================
       ATUALIZAR RELATÓRIO
    ====================================================== */

    async function atualizarRelatorio() {

        try {

            const mesSelecionado =
                relatorioMes?.value ||
                mesAtualSistema;


            if (btnAtualizarRelatorio) {

                btnAtualizarRelatorio.disabled =
                    true;

                btnAtualizarRelatorio.textContent =
                    "Atualizando...";

            }


            await carregarDados();


            renderizar(
                mesSelecionado
            );


            console.log(
                "✅ Relatório atualizado com sucesso."
            );

        } catch (erro) {

            console.error(
                "❌ Erro ao atualizar relatório:",
                erro
            );


            exibirErro(
                `Não foi possível carregar o relatório: ${erro.message}`
            );

        } finally {

            if (btnAtualizarRelatorio) {

                btnAtualizarRelatorio.disabled =
                    false;

                btnAtualizarRelatorio.textContent =
                    "Atualizar";

            }

        }

    }


    /* =====================================================
       EVENTOS
    ====================================================== */

    if (
        btnAtualizarRelatorio
    ) {

        btnAtualizarRelatorio.addEventListener(
            "click",
            atualizarRelatorio
        );

    }


    if (
        relatorioMes
    ) {

        relatorioMes.addEventListener(
            "change",
            atualizarRelatorio
        );

    }


    /* =====================================================
       EXECUÇÃO INICIAL
    ====================================================== */

    await atualizarRelatorio();


});