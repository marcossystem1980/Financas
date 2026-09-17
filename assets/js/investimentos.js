document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const METAS_KEY =
        "financasCasal_metas";


    const INVESTIMENTOS_KEY =
        "financasCasal_investimentos";


    const form =
        document.getElementById(
            "investimentoForm"
        );


    const valorAporte =
        document.getElementById(
            "valorAporte"
        );

    const dataAporte =
        document.getElementById(
            "dataAporte"
        );

    const tipoInvestimento =
        document.getElementById(
            "tipoInvestimento"
        );

    const responsavel =
        document.getElementById(
            "responsavelInvestimento"
        );

    const metaInvestimento =
        document.getElementById(
            "metaInvestimento"
        );

    const observacaoAporte =
        document.getElementById(
            "observacaoAporte"
        );


    const aportesMes =
        document.getElementById(
            "aportesMes"
        );

    const totalAportado =
        document.getElementById(
            "totalAportado"
        );

    const aporteMedio =
        document.getElementById(
            "aporteMedio"
        );

    const quantidadeAportes =
        document.getElementById(
            "quantidadeAportes"
        );


    const metaPrincipalNome =
        document.getElementById(
            "metaPrincipalNome"
        );

    const metaPrincipalDescricao =
        document.getElementById(
            "metaPrincipalDescricao"
        );

    const metaPrincipalPercentual =
        document.getElementById(
            "metaPrincipalPercentual"
        );


    const recentInvestments =
        document.getElementById(
            "recentInvestments"
        );


    const investmentHistory =
        document.getElementById(
            "investmentHistory"
        );


    const emptyHistory =
        document.getElementById(
            "emptyHistory"
        );


    const historicoCount =
        document.getElementById(
            "historicoCount"
        );


    let metas =
        carregar(
            METAS_KEY
        );


    let investimentos =
        carregar(
            INVESTIMENTOS_KEY
        );


    /* =====================================================
       STORAGE
    ====================================================== */

    function carregar(chave) {

        const dados =
            localStorage.getItem(
                chave
            );


        if (!dados) {
            return [];
        }


        try {

            return JSON.parse(
                dados
            );

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
            JSON.stringify(
                dados
            )
        );

    }


    /* =====================================================
       AUXILIARES
    ====================================================== */

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


    function formatarData(data) {

        const partes =
            data.split("-");


        return (
            `${partes[2]}/${partes[1]}/${partes[0]}`
        );

    }


    function atualizarMetas() {

        metas =
            carregar(
                METAS_KEY
            );

    }


    function atualizarInvestimentos() {

        investimentos =
            carregar(
                INVESTIMENTOS_KEY
            );

    }


    /* =====================================================
       SELECT DE METAS
    ====================================================== */

    function preencherMetas() {

        metaInvestimento.innerHTML = `

            <option value="">
                Sem meta específica
            </option>

        `;


        const metasInvestimento =
            metas.filter(
                function (meta) {

                    return (
                        meta.tipo ===
                        "Investimento"
                    );

                }
            );


        metasInvestimento.forEach(
            function (meta) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    meta.id;


                option.textContent =
                    meta.nome;


                metaInvestimento.appendChild(
                    option
                );

            }
        );

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const mesAtual =
            dataAtual().slice(
                0,
                7
            );


        const aportesDoMes =
            investimentos.filter(
                function (item) {

                    return (
                        item.data.startsWith(
                            mesAtual
                        )
                    );

                }
            );


        const totalMes =
            aportesDoMes.reduce(
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


        const total =
            investimentos.reduce(
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


        const media =
            investimentos.length > 0
                ? total /
                  investimentos.length
                : 0;


        aportesMes.textContent =
            moeda(totalMes);


        totalAportado.textContent =
            moeda(total);


        aporteMedio.textContent =
            moeda(media);


        quantidadeAportes.textContent =
            investimentos.length;

    }


    /* =====================================================
       META PRINCIPAL
    ====================================================== */

    function atualizarMetaPrincipal() {

        const metasInvestimento =
            metas.filter(
                function (meta) {

                    return (
                        meta.tipo ===
                        "Investimento"
                    );

                }
            );


        if (
            metasInvestimento.length ===
            0
        ) {

            metaPrincipalNome.textContent =
                "Nenhuma meta de investimento";


            metaPrincipalDescricao.textContent =
                "Crie uma meta do tipo Investimento em Metas.";


            metaPrincipalPercentual.textContent =
                "0%";


            return;

        }


        const meta =
            metasInvestimento.find(
                function (item) {

                    return (
                        Number(item.atual) <
                        Number(item.objetivo)
                    );

                }
            ) ||
            metasInvestimento[0];


        const percentual =
            Number(meta.objetivo) > 0
                ? Math.min(
                    100,
                    (
                        Number(meta.atual) /
                        Number(meta.objetivo)
                    ) * 100
                )
                : 0;


        metaPrincipalNome.textContent =
            meta.nome;


        metaPrincipalDescricao.textContent =
            `${moeda(meta.atual)} de ${moeda(meta.objetivo)}`;


        metaPrincipalPercentual.textContent =
            `${percentual.toFixed(1)}%`;

    }


    /* =====================================================
       RECENTES
    ====================================================== */

    function renderizarRecentes() {

        recentInvestments.innerHTML =
            "";


        const recentes =
            [...investimentos]
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${b.data}T00:00:00`
                            ) -
                            new Date(
                                `${a.data}T00:00:00`
                            )
                        );

                    }
                )
                .slice(
                    0,
                    5
                );


        if (
            recentes.length ===
            0
        ) {

            recentInvestments.innerHTML = `

                <div class="empty-investment-state">
                    Nenhum aporte registrado.
                </div>

            `;

            return;

        }


        recentes.forEach(
            function (item) {

                const meta =
                    metas.find(
                        function (metaItem) {

                            return (
                                metaItem.id ===
                                item.metaId
                            );

                        }
                    );


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "recent-item";


                elemento.innerHTML = `

                    <div class="recent-icon">
                        💰
                    </div>

                    <div class="recent-info">

                        <strong>
                            ${moeda(item.valor)}
                        </strong>

                        <span>
                            ${formatarData(item.data)}
                            ·
                            ${item.tipo}
                            ${
                                meta
                                    ? ` · ${meta.nome}`
                                    : ""
                            }
                        </span>

                    </div>

                    <strong class="recent-value">
                        ${item.responsavel}
                    </strong>

                `;


                recentInvestments.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       HISTÓRICO
    ====================================================== */

    function renderizarHistorico() {

        investmentHistory.innerHTML =
            "";


        const registros =
            [...investimentos]
                .sort(
                    function (a, b) {

                        return (
                            new Date(
                                `${b.data}T00:00:00`
                            ) -
                            new Date(
                                `${a.data}T00:00:00`
                            )
                        );

                    }
                );


        historicoCount.textContent =
            `${registros.length} ${
                registros.length === 1
                    ? "registro"
                    : "registros"
            }`;


        if (
            registros.length ===
            0
        ) {

            emptyHistory.style.display =
                "block";

            return;

        }


        emptyHistory.style.display =
            "none";


        registros.forEach(
            function (item) {

                const meta =
                    metas.find(
                        function (metaItem) {

                            return (
                                metaItem.id ===
                                item.metaId
                            );

                        }
                    );


                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>
                        ${formatarData(item.data)}
                    </td>

                    <td class="value-cell">
                        ${moeda(item.valor)}
                    </td>

                    <td>
                        ${item.tipo}
                    </td>

                    <td>
                        ${item.responsavel}
                    </td>

                    <td>
                        ${meta?.nome || "—"}
                    </td>

                    <td>
                        ${item.observacao || "—"}
                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${item.id}"
                            title="Excluir aporte"
                        >
                            ×
                        </button>

                    </td>

                `;


                investmentHistory.appendChild(
                    linha
                );

            }
        );

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    function atualizarTela() {

        atualizarMetas();

        atualizarInvestimentos();

        preencherMetas();

        atualizarResumo();

        atualizarMetaPrincipal();

        renderizarRecentes();

        renderizarHistorico();

    }


    /* =====================================================
       NOVO APORTE
    ====================================================== */

    form.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const valor =
                Number(
                    valorAporte.value
                );


            if (
                !valor ||
                valor <= 0
            ) {

                alert(
                    "Informe um valor de aporte válido."
                );

                return;

            }


            const novoInvestimento = {

                id:
                    criarId(),

                valor:
                    valor,

                data:
                    dataAporte.value,

                tipo:
                    tipoInvestimento.value,

                responsavel:
                    responsavel.value,

                metaId:
                    metaInvestimento.value,

                observacao:
                    observacaoAporte.value.trim()

            };


            if (
                !novoInvestimento.data ||
                !novoInvestimento.tipo
            ) {

                alert(
                    "Preencha os campos obrigatórios."
                );

                return;

            }


            investimentos.push(
                novoInvestimento
            );


            salvar(
                INVESTIMENTOS_KEY,
                investimentos
            );


            /* ==============================================
               ATUALIZA META VINCULADA
            ============================================== */

            if (
                novoInvestimento.metaId
            ) {

                metas =
                    metas.map(
                        function (meta) {

                            if (
                                meta.id ===
                                novoInvestimento.metaId
                            ) {

                                meta.atual =
                                    Math.min(
                                        Number(
                                            meta.objetivo
                                        ),
                                        Number(
                                            meta.atual
                                        ) +
                                        valor
                                    );

                            }


                            return meta;

                        }
                    );


                salvar(
                    METAS_KEY,
                    metas
                );

            }


            form.reset();


            dataAporte.value =
                dataAtual();


            atualizarTela();

        }
    );


    /* =====================================================
       EXCLUIR APORTE
    ====================================================== */

    investmentHistory.addEventListener(
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


            const investimento =
                investimentos.find(
                    function (item) {

                        return (
                            item.id ===
                            id
                        );

                    }
                );


            if (!investimento) {
                return;
            }


            const confirmar =
                confirm(
                    "Deseja excluir este aporte?"
                );


            if (!confirmar) {
                return;
            }


            /*
            Reverte o valor da meta
            */

            if (
                investimento.metaId
            ) {

                metas =
                    metas.map(
                        function (meta) {

                            if (
                                meta.id ===
                                investimento.metaId
                            ) {

                                meta.atual =
                                    Math.max(
                                        0,
                                        Number(
                                            meta.atual
                                        ) -
                                        Number(
                                            investimento.valor
                                        )
                                    );

                            }


                            return meta;

                        }
                    );


                salvar(
                    METAS_KEY,
                    metas
                );

            }


            investimentos =
                investimentos.filter(
                    function (item) {

                        return (
                            item.id !==
                            id
                        );

                    }
                );


            salvar(
                INVESTIMENTOS_KEY,
                investimentos
            );


            atualizarTela();

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    dataAporte.value =
        dataAtual();


    atualizarTela();

});