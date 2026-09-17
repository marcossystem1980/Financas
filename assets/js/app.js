document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CHAVES
    ====================================================== */

    const PERFIL_KEY =
        "financasCasal_perfil";

    const DESPESAS_KEY =
        "financasCasal_despesas";

    const CONTAS_KEY =
        "financasCasal_contas";

    const INVESTIMENTOS_KEY =
        "financasCasal_investimentos";

    const METAS_KEY =
        "financasCasal_metas";

    const COMPRAS_KEY =
        "financasCasal_compras";

    const SONHOS_KEY =
        "financasCasal_sonhos";

    const MOBILIA_KEY =
        "financasCasal_mobilia";


    /* =====================================================
       FUNÇÕES DE LEITURA
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
                "Erro ao carregar:",
                chave,
                erro
            );

            return [];

        }

    }


    function carregarObjeto(chave) {

        const dados =
            localStorage.getItem(chave);


        if (!dados) {

            return {};

        }


        try {

            return JSON.parse(dados);

        } catch (erro) {

            console.error(
                "Erro ao carregar:",
                chave,
                erro
            );

            return {};

        }

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
        ).format(
            Number(valor) || 0
        );

    }


    function percentual(
        valor,
        total
    ) {

        if (
            total <= 0
        ) {

            return 0;

        }


        return (
            Number(valor) /
            Number(total)
        ) * 100;

    }


    function escaparHTML(valor) {

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


        return `${ano}-${mes}-${dia}`;

    }


    function nomeMes(mes) {

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


    function nomeMesCurto(mes) {

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


    function formatarData(data) {

        if (!data) {

            return "—";

        }


        const partes =
            data.split("-");


        if (
            partes.length !== 3
        ) {

            return data;

        }


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
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
       CARREGAR DADOS
    ====================================================== */

    const perfil =
        carregarObjeto(
            PERFIL_KEY
        );


    const despesas =
        carregar(
            DESPESAS_KEY
        );


    const contas =
        carregar(
            CONTAS_KEY
        );


    const investimentos =
        carregar(
            INVESTIMENTOS_KEY
        );


    const metas =
        carregar(
            METAS_KEY
        );


    const compras =
        carregar(
            COMPRAS_KEY
        );


    const sonhos =
        carregar(
            SONHOS_KEY
        );


    const mobilia =
        carregar(
            MOBILIA_KEY
        );



    /* =====================================================
       RENDA
    ====================================================== */

    const salario1 =
        Number(
            perfil.salario1
        ) || 0;


    const salario2 =
        Number(
            perfil.salario2
        ) || 0;


    const rendaTotal =
        salario1 +
        salario2;



    /* =====================================================
       DESPESAS
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
       INVESTIMENTOS
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
       CONTAS
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
       FATURA DOS CARTÕES
    ====================================================== */

    function gerarParcelas(
        compra
    ) {

        const resultado = [];


        const quantidade =
            Number(
                compra.parcelas
            );


        if (
            !quantidade
        ) {

            return resultado;

        }


        const valorParcela =
            Number(
                compra.valorTotal
            ) /
            quantidade;


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
                function (parcela) {

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
            moeda(rendaTotal);

    }


    if (despesasCard) {

        despesasCard.textContent =
            moeda(totalDespesas);

    }


    if (investimentosCard) {

        investimentosCard.textContent =
            moeda(totalInvestimentos);

    }


    if (disponivelCard) {

        disponivelCard.textContent =
            moeda(disponivel);

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
            moeda(rendaTotal);

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


        const p =
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


        if (p) {

            p.textContent =
                `${perc.toFixed(1)}%`;

        }


        if (barra) {

            barra.style.width =
                `${percBarra}%`;

        }


        if (valorElemento) {

            valorElemento.textContent =
                moeda(valor);

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


    if (gastosCategorias) {

        const categorias = {};


        despesasMes.forEach(
            function (despesa) {

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
                function (a, b) {

                    return (
                        b[1] -
                        a[1]
                    );

                }
            );


        gastosCategorias.innerHTML =
            "";


        if (
            listaCategorias.length === 0
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
                    function (item) {

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
                                    style="width: ${Math.min(100, perc)}%;"
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


    if (dashboardContas) {

        const proximas =
            contasPendentes
                .sort(
                    function (a, b) {

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
            proximas.length === 0
        ) {

            dashboardContas.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhuma conta pendente neste mês.

                </div>

            `;

        } else {


            proximas.forEach(
                function (conta) {

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
                                ${partes[2]}
                            </strong>

                            <span>
                                ${nomeMesCurto(partes[1])}
                            </span>

                        </div>


                        <div class="bill-info">

                            <strong>
                                ${escaparHTML(conta.descricao)}
                            </strong>

                            <span>
                                ${escaparHTML(conta.categoria)}
                            </span>

                        </div>


                        <strong class="bill-value">
                            ${moeda(conta.valor)}
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


    if (dashboardMetas) {

        const metasOrdenadas =
            [...metas]
                .sort(
                    function (a, b) {

                        const pA =
                            Number(a.objetivo) > 0
                                ? Number(a.atual) /
                                  Number(a.objetivo)
                                : 0;


                        const pB =
                            Number(b.objetivo) > 0
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
            metasOrdenadas.length === 0
        ) {

            dashboardMetas.innerHTML = `

                <div class="empty-state-dashboard">

                    Nenhuma meta cadastrada.

                </div>

            `;

        } else {


            metasOrdenadas.forEach(
                function (meta) {

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
                                    ${escaparHTML(meta.nome)}
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


    if (dashboardSonhos) {


        const sonhosAtivos =
            sonhos
                .filter(
                    function (sonho) {

                        return (
                            !sonho.concluido
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            Number(b.reservado) /
                            Number(b.valor) -
                            Number(a.reservado) /
                            Number(a.valor)
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
                function (sonho) {

                    const objetivo =
                        Number(
                            sonho.valor
                        );


                    const reservado =
                        Number(
                            sonho.reservado
                        );


                    const p =
                        objetivo > 0
                            ? Math.min(
                                100,
                                (
                                    reservado /
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
                                    ${escaparHTML(sonho.nome)}
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
                    function (item) {

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


        mobiliaResumo.textContent =
            mobilia.length === 0
                ? "Nenhum item cadastrado."
                : `${mobilia.filter(
                    item => item.comprado
                ).length} de ${
                    mobilia.length
                } itens comprados`;

    }



    /* =====================================================
       ATUALIZAÇÃO EM OUTRAS ABAS
    ====================================================== */

    window.addEventListener(
        "storage",
        function (evento) {

            const chavesAtualizadas = [

                PERFIL_KEY,

                DESPESAS_KEY,

                CONTAS_KEY,

                INVESTIMENTOS_KEY,

                METAS_KEY,

                COMPRAS_KEY,

                SONHOS_KEY,

                MOBILIA_KEY

            ];


            if (
                chavesAtualizadas.includes(
                    evento.key
                )
            ) {

                window.location.reload();

            }

        }
    );


});