document.addEventListener(
    "DOMContentLoaded",
    async function () {


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
        mes
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
                Number(mes) - 1
            ] || ""
        );

    }


    function nomeMesCurto(
        mes
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
                Number(mes) - 1
            ] || ""
        );

    }


    /* =====================================================
       MÊS ATUAL
    ====================================================== */

    const mesAtual =
        dataAtual().slice(
            0,
            7
        );


    const partesMes =
        mesAtual.split("-");


    const anoAtual =
        partesMes[0];


    const numeroMesAtual =
        partesMes[1];


    const dashboardMes =
        document.getElementById(
            "dashboardMes"
        );


    if (dashboardMes) {

        dashboardMes.textContent =
            `${nomeMes(numeroMesAtual)} ${anoAtual}`;

    }


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
            "login.html";

        return;

    }


    console.log(
        "👤 Usuário autenticado:",
        user.email
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

        return;

    }


    const casalId =
        membro.casal_id;


    console.log(
        "✅ Casal identificado:",
        casalId
    );


    /* =====================================================
       CARREGAR TODOS OS DADOS DO SUPABASE
    ====================================================== */

    const [

        perfilResultado,

        despesasResultado,

        contasResultado,

        comprasResultado,

        investimentosResultado,

        metasResultado,

        sonhosResultado,

        mobiliaResultado

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
            ),


        supabaseClient
            .from("sonhos")
            .select(
                `
                id,
                nome,
                tipo,
                valor,
                reservado,
                prioridade,
                prazo,
                concluido
                `
            )
            .eq(
                "casal_id",
                casalId
            ),


        supabaseClient
            .from("mobilia")
            .select(
                `
                id,
                nome,
                ambiente,
                valor,
                prioridade,
                comprado
                `
            )
            .eq(
                "casal_id",
                casalId
            )

    ]);


    /* =====================================================
       VALIDAR CONSULTAS
    ====================================================== */

    if (
        perfilResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar perfil financeiro:",
            perfilResultado.error
        );

        return;

    }


    if (
        despesasResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar despesas:",
            despesasResultado.error
        );

        return;

    }


    if (
        contasResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar contas:",
            contasResultado.error
        );

        return;

    }


    if (
        comprasResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar compras de cartão:",
            comprasResultado.error
        );

        return;

    }


    if (
        investimentosResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar investimentos:",
            investimentosResultado.error
        );

        return;

    }


    if (
        metasResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar metas:",
            metasResultado.error
        );

        return;

    }


    if (
        sonhosResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar sonhos:",
            sonhosResultado.error
        );

        return;

    }


    if (
        mobiliaResultado.error
    ) {

        console.error(
            "❌ Erro ao carregar mobília:",
            mobiliaResultado.error
        );

        return;

    }


    /* =====================================================
       ORGANIZAR DADOS
    ====================================================== */

    const perfil =
        perfilResultado.data;


    const despesas =
        despesasResultado.data ||
        [];


    const contas =
        contasResultado.data ||
        [];


    const compras =
        comprasResultado.data ||
        [];


    const investimentos =
        investimentosResultado.data ||
        [];


    const metas =
        metasResultado.data ||
        [];


    const sonhos =
        sonhosResultado.data ||
        [];


    const mobilia =
        mobiliaResultado.data ||
        [];


    console.log(
        "✅ Dados do Dashboard carregados do Supabase."
    );


    console.log(
        "📊 Despesas:",
        despesas.length
    );


    console.log(
        "📊 Contas:",
        contas.length
    );


    console.log(
        "📊 Compras cartão:",
        compras.length
    );


    console.log(
        "📊 Investimentos:",
        investimentos.length
    );


    console.log(
        "📊 Metas:",
        metas.length
    );


    console.log(
        "📊 Sonhos:",
        sonhos.length
    );


    console.log(
        "📊 Mobília:",
        mobilia.length
    );


    /* =====================================================
       RENDA
    ====================================================== */

    const salario1 =
        Number(
            perfil?.salario1
        ) || 0;


    const salario2 =
        Number(
            perfil?.salario2
        ) || 0;


    const rendaTotal =
        salario1 +
        salario2;


    /* =====================================================
       DESPESAS DO MÊS
    ====================================================== */

    const despesasMes =
        despesas.filter(
            function (despesa) {

                return (
                    despesa.data &&
                    despesa.data.startsWith(
                        mesAtual
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
                    Number(
                        despesa.valor
                    )
                );

            },
            0
        );


    const gastosPessoais =
        despesasMes
            .filter(
                function (despesa) {

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
                        Number(
                            despesa.valor
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


    /* =====================================================
       INVESTIMENTOS DO MÊS
    ====================================================== */

    const investimentosMes =
        investimentos.filter(
            function (item) {

                return (
                    item.data &&
                    item.data.startsWith(
                        mesAtual
                    )
                );

            }
        );


    const totalInvestimentos =
        investimentosMes.reduce(
            function (
                soma,
                item
            ) {

                return (
                    soma +
                    Number(
                        item.valor
                    )
                );

            },
            0
        );


    /* =====================================================
       CONTAS DO MÊS
    ====================================================== */

    const contasMes =
        contas.filter(
            function (conta) {

                return (
                    conta.vencimento &&
                    conta.vencimento.startsWith(
                        mesAtual
                    )
                );

            }
        );


    const contasPendentes =
        contasMes.filter(
            function (conta) {

                return (
                    conta.status !==
                    "Pago"
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
                    Number(
                        conta.valor
                    )
                );

            },
            0
        );


    /* =====================================================
       PARCELAS DOS CARTÕES
    ====================================================== */

    function gerarParcelas(
        compra
    ) {

        const resultado = [];


        const quantidade =
            Number(
                compra.parcelas
            ) || 1;


        const valorTotal =
            Number(
                compra.valor_total
            ) || 0;


        const valorParcela =
            quantidade > 0
                ? valorTotal /
                  quantidade
                : 0;


        if (
            valorParcela <= 0 ||
            !compra.data_compra
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
                    valorParcela

            });

        }


        return resultado;

    }


    let faturaCartao =
        0;


    compras.forEach(
        function (compra) {

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
                        mesAtual
                    ) {

                        faturaCartao +=
                            Number(
                                parcela.valor
                            );

                    }

                }
            );

        }
    );


    /* =====================================================
       DISPONÍVEL
    ====================================================== */

    const disponivel =
        Math.max(
            0,
            rendaTotal -
            totalDespesas -
            totalInvestimentos -
            totalContasPendentes -
            faturaCartao
        );


    /* =====================================================
       CARDS PRINCIPAIS
    ====================================================== */

    const rendaCard =
        document.getElementById(
            "rendaTotalDashboard"
        );


    const despesasCard =
        document.getElementById(
            "despesasDashboard"
        );


    const investimentosCard =
        document.getElementById(
            "investimentosDashboard"
        );


    const disponivelCard =
        document.getElementById(
            "disponivelDashboard"
        );


    if (rendaCard) {

        rendaCard.textContent =
            moeda(
                rendaTotal
            );

    }


    if (despesasCard) {

        despesasCard.textContent =
            moeda(
                totalDespesas
            );

    }


    if (investimentosCard) {

        investimentosCard.textContent =
            moeda(
                totalInvestimentos
            );

    }


    if (disponivelCard) {

        disponivelCard.textContent =
            moeda(
                disponivel
            );

    }


    /* =====================================================
       DESTINO DO DINHEIRO
    ====================================================== */

    const distribuicaoTotal =
        document.getElementById(
            "distribuicaoTotal"
        );


    if (distribuicaoTotal) {

        distribuicaoTotal.textContent =
            moeda(
                rendaTotal
            );

    }


    function atualizarDistribuicao(
        valor,
        percentualId,
        barraId,
        valorId
    ) {

        const perc =
            percentual(
                valor,
                rendaTotal
            );


        const percBarra =
            Math.min(
                100,
                Math.max(
                    0,
                    perc
                )
            );


        const percentualElemento =
            document.getElementById(
                percentualId
            );


        const barra =
            document.getElementById(
                barraId
            );


        const valorElemento =
            document.getElementById(
                valorId
            );


        if (
            percentualElemento
        ) {

            percentualElemento.textContent =
                `${perc.toFixed(1)}%`;

        }


        if (
            barra
        ) {

            barra.style.width =
                `${percBarra}%`;

        }


        if (
            valorElemento
        ) {

            valorElemento.textContent =
                moeda(
                    valor
                );

        }

    }


    atualizarDistribuicao(
        despesasCasa,
        "distCasaPercentual",
        "distCasaBar",
        "distCasaValor"
    );


    atualizarDistribuicao(
        totalInvestimentos,
        "distInvestimentosPercentual",
        "distInvestimentosBar",
        "distInvestimentosValor"
    );


    atualizarDistribuicao(
        gastosPessoais,
        "distPessoalPercentual",
        "distPessoalBar",
        "distPessoalValor"
    );


    atualizarDistribuicao(
        totalContasPendentes,
        "distContasPercentual",
        "distContasBar",
        "distContasValor"
    );


    atualizarDistribuicao(
        disponivel,
        "distLivrePercentual",
        "distLivreBar",
        "distLivreValor"
    );


    /* =====================================================
       GASTOS POR CATEGORIA
    ====================================================== */

    const gastosCategorias =
        document.getElementById(
            "gastosCategorias"
        );


    if (
        gastosCategorias
    ) {

        const categorias = {};


        despesasMes.forEach(
            function (
                despesa
            ) {

                const categoria =
                    despesa.categoria ||
                    "Outros";


                if (
                    !categorias[categoria]
                ) {

                    categorias[categoria] =
                        0;

                }


                categorias[categoria] +=
                    Number(
                        despesa.valor
                    );

            }
        );


        const listaCategorias =
            Object.entries(
                categorias
            ).sort(
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


        gastosCategorias.innerHTML =
            "";


        if (
            listaCategorias.length ===
            0
        ) {

            gastosCategorias.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhuma despesa registrada neste mês.

                </div>

            `;

        } else {

            const totalCategorias =
                listaCategorias.reduce(
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


            listaCategorias
                .slice(
                    0,
                    5
                )
                .forEach(
                    function (
                        item
                    ) {

                        const nome =
                            item[0];


                        const valor =
                            item[1];


                        const perc =
                            percentual(
                                valor,
                                totalCategorias
                            );


                        const elemento =
                            document.createElement(
                                "div"
                            );


                        elemento.className =
                            "budget-item";


                        elemento.innerHTML = `

                            <div class="budget-info">

                                <span>
                                    ${escaparHTML(nome)}
                                </span>

                                <strong>
                                    ${moeda(valor)}
                                </strong>

                            </div>

                            <div class="budget-bar">

                                <span
                                    style="width: ${Math.min(
                                        100,
                                        perc
                                    )}%;"
                                ></span>

                            </div>

                        `;


                        gastosCategorias.appendChild(
                            elemento
                        );

                    }
                );

        }

    }


    /* =====================================================
       PRÓXIMAS CONTAS
    ====================================================== */

    const dashboardContas =
        document.getElementById(
            "dashboardContas"
        );


    if (
        dashboardContas
    ) {

        const proximas =
            [...contasPendentes]
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            a.vencimento.localeCompare(
                                b.vencimento
                            )
                        );

                    }
                )
                .slice(
                    0,
                    4
                );


        dashboardContas.innerHTML =
            "";


        if (
            proximas.length ===
            0
        ) {

            dashboardContas.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhuma conta pendente neste mês.

                </div>

            `;

        } else {

            proximas.forEach(
                function (
                    conta
                ) {

                    const partes =
                        conta.vencimento.split(
                            "-"
                        );


                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "bill-item";


                    elemento.innerHTML = `

                        <div class="bill-date">

                            <strong>
                                ${escaparHTML(
                                    partes[2]
                                )}
                            </strong>

                            <span>
                                ${escaparHTML(
                                    nomeMesCurto(
                                        partes[1]
                                    )
                                )}
                            </span>

                        </div>


                        <div class="bill-info">

                            <strong>
                                ${escaparHTML(
                                    conta.descricao
                                )}
                            </strong>

                            <span>
                                ${escaparHTML(
                                    conta.categoria
                                )}
                            </span>

                        </div>


                        <strong class="bill-value">
                            ${moeda(
                                conta.valor
                            )}
                        </strong>

                    `;


                    dashboardContas.appendChild(
                        elemento
                    );

                }
            );

        }

    }


    /* =====================================================
       METAS
    ====================================================== */

    const dashboardMetas =
        document.getElementById(
            "dashboardMetas"
        );


    if (
        dashboardMetas
    ) {

        const metasOrdenadas =
            [...metas]
                .sort(
                    function (
                        a,
                        b
                    ) {

                        const pA =
                            Number(
                                a.objetivo
                            ) > 0
                                ? Number(a.atual) /
                                  Number(a.objetivo)
                                : 0;


                        const pB =
                            Number(
                                b.objetivo
                            ) > 0
                                ? Number(b.atual) /
                                  Number(b.objetivo)
                                : 0;


                        return (
                            pA -
                            pB
                        );

                    }
                )
                .slice(
                    0,
                    3
                );


        dashboardMetas.innerHTML =
            "";


        if (
            metasOrdenadas.length ===
            0
        ) {

            dashboardMetas.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhuma meta cadastrada.

                </div>

            `;

        } else {

            metasOrdenadas.forEach(
                function (
                    meta
                ) {

                    const objetivo =
                        Number(
                            meta.objetivo
                        );


                    const atual =
                        Number(
                            meta.atual
                        );


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


                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "goal-item";


                    elemento.innerHTML = `

                        <div class="goal-info">

                            <div>

                                <strong>
                                    ${escaparHTML(
                                        meta.nome
                                    )}
                                </strong>

                                <span>
                                    ${moeda(atual)}
                                    de
                                    ${moeda(objetivo)}
                                </span>

                            </div>

                            <strong>
                                ${p.toFixed(1)}%
                            </strong>

                        </div>


                        <div class="goal-bar">

                            <span
                                style="width: ${p}%;"
                            ></span>

                        </div>

                    `;


                    dashboardMetas.appendChild(
                        elemento
                    );

                }
            );

        }

    }


    /* =====================================================
       SONHOS
    ====================================================== */

    const dashboardSonhos =
        document.getElementById(
            "dashboardSonhos"
        );


    function progressoSonho(
        sonho
    ) {

        const objetivo =
            Number(
                sonho.valor
            );


        const reservado =
            Number(
                sonho.reservado
            );


        if (
            objetivo <= 0
        ) {

            return 0;

        }


        return Math.min(
            100,
            (
                reservado /
                objetivo
            ) * 100
        );

    }


    if (
        dashboardSonhos
    ) {

        const sonhosAtivos =
            [...sonhos]
                .filter(
                    function (
                        sonho
                    ) {

                        return (
                            !sonho.concluido
                        );

                    }
                )
                .sort(
                    function (
                        a,
                        b
                    ) {

                        return (
                            progressoSonho(b) -
                            progressoSonho(a)
                        );

                    }
                )
                .slice(
                    0,
                    3
                );


        dashboardSonhos.innerHTML =
            "";


        if (
            sonhosAtivos.length ===
            0
        ) {

            dashboardSonhos.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhum sonho em andamento.

                </div>

            `;

        } else {

            sonhosAtivos.forEach(
                function (
                    sonho
                ) {

                    const objetivo =
                        Number(
                            sonho.valor
                        );


                    const reservado =
                        Number(
                            sonho.reservado
                        );


                    const p =
                        progressoSonho(
                            sonho
                        );


                    const elemento =
                        document.createElement(
                            "div"
                        );


                    elemento.className =
                        "goal-item";


                    elemento.innerHTML = `

                        <div class="goal-info">

                            <div>

                                <strong>
                                    ${escaparHTML(
                                        sonho.nome
                                    )}
                                </strong>

                                <span>
                                    ${moeda(reservado)}
                                    de
                                    ${moeda(objetivo)}
                                </span>

                            </div>

                            <strong>
                                ${p.toFixed(1)}%
                            </strong>

                        </div>


                        <div class="goal-bar">

                            <span
                                style="width: ${p}%;"
                            ></span>

                        </div>

                    `;


                    dashboardSonhos.appendChild(
                        elemento
                    );

                }
            );

        }

    }


    /* =====================================================
       MOBÍLIA
    ====================================================== */

    const mobiliaPercentual =
        document.getElementById(
            "mobiliaPercentual"
        );


    const mobiliaBarra =
        document.getElementById(
            "mobiliaBarra"
        );


    const mobiliaComprado =
        document.getElementById(
            "mobiliaComprado"
        );


    const mobiliaTotal =
        document.getElementById(
            "mobiliaTotal"
        );


    const mobiliaResumo =
        document.getElementById(
            "mobiliaResumo"
        );


    if (
        mobiliaPercentual &&
        mobiliaBarra &&
        mobiliaComprado &&
        mobiliaTotal &&
        mobiliaResumo
    ) {

        const totalMobilia =
            mobilia.reduce(
                function (
                    soma,
                    item
                ) {

                    return (
                        soma +
                        Number(
                            item.valor
                        )
                    );

                },
                0
            );


        const compradoMobilia =
            mobilia
                .filter(
                    function (
                        item
                    ) {

                        return (
                            item.comprado
                        );

                    }
                )
                .reduce(
                    function (
                        soma,
                        item
                    ) {

                        return (
                            soma +
                            Number(
                                item.valor
                            )
                        );

                    },
                    0
                );


        const percentualMobilia =
            totalMobilia > 0
                ? (
                    compradoMobilia /
                    totalMobilia
                ) * 100
                : 0;


        mobiliaPercentual.textContent =
            `${percentualMobilia.toFixed(1)}%`;


        mobiliaBarra.style.width =
            `${Math.min(
                100,
                percentualMobilia
            )}%`;


        mobiliaComprado.textContent =
            moeda(
                compradoMobilia
            );


        mobiliaTotal.textContent =
            `de ${moeda(totalMobilia)}`;


        const quantidadeComprada =
            mobilia.filter(
                function (
                    item
                ) {

                    return (
                        item.comprado
                    );

                }
            ).length;


        mobiliaResumo.textContent =
            mobilia.length ===
            0
                ? "Nenhum item cadastrado."
                : `${quantidadeComprada} de ${mobilia.length} itens comprados`;

    }


    /* =====================================================
       LOG FINAL
    ====================================================== */

    console.log(
        "✅ Dashboard carregado 100% pelo Supabase."
    );


});