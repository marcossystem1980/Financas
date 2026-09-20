document.addEventListener("DOMContentLoaded", async function () {


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
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_despesas";

    const MIGRACAO_KEY =
        "financasCasal_despesas_migrado";


    let despesas = [];

    let casalId = null;


    /* =====================================================
       FUNÇÕES AUXILIARES
    ====================================================== */

    function moeda(valorNumerico) {

        return new Intl.NumberFormat(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        ).format(
            Number(valorNumerico) || 0
        );

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


    function escaparHTML(valorTexto) {

        return String(
            valorTexto ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

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
            .eq("id", user.id)
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
       CARREGAR DESPESAS DO SUPABASE
    ====================================================== */

    async function carregarDespesasSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("despesas")
            .select("*")
            .eq("casal_id", casalId)
            .order("data", {
                ascending: false
            });


        if (error) {

            console.error(
                "❌ Erro ao carregar despesas:",
                error
            );

            return false;

        }


        despesas =
            data || [];


        console.log(
            `✅ ${despesas.length} despesa(s) carregada(s) do Supabase.`
        );


        return true;

    }


    /* =====================================================
       LER DADOS ANTIGOS DO LOCALSTORAGE
    ====================================================== */

    function carregarDespesasLocais() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {
            return [];
        }


        try {

            const registros =
                JSON.parse(dados);


            if (
                !Array.isArray(registros)
            ) {

                return [];

            }


            return registros;

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar despesas locais:",
                erro
            );

            return [];

        }

    }


    /* =====================================================
       MIGRAR LOCALSTORAGE → SUPABASE
    ====================================================== */

    async function migrarDespesas() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (jaMigrado === "true") {

            return;

        }


        const locais =
            carregarDespesasLocais();


        if (
            locais.length === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            return;

        }


        /*
           Verificamos se já existe alguma despesa
           no Supabase antes de importar.
        */

        const {
            count,
            error: countError
        } = await supabaseClient
            .from("despesas")
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


        if (countError) {

            console.error(
                "❌ Não foi possível verificar despesas existentes:",
                countError
            );

            return;

        }


        /*
           Se já houver dados no Supabase,
           não fazemos importação automática
           para não criar duplicidades.
        */

        if (
            Number(count) > 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );

            console.log(
                "ℹ️ Já existem despesas no Supabase. Migração local não executada."
            );

            return;

        }


        console.log(
            "📦 Migrando despesas antigas para o Supabase..."
        );


        const registrosParaInserir =
            locais.map(function (despesa) {

                return {

                    casal_id:
                        casalId,

                    descricao:
                        String(
                            despesa.descricao || ""
                        ).trim(),

                    valor:
                        Number(
                            despesa.valor
                        ) || 0,

                    data:
                        despesa.data,

                    categoria:
                        despesa.categoria ||
                        "Outros",

                    tipo:
                        despesa.tipo ||
                        "Variável",

                    pagador:
                        despesa.pagador ||
                        "Casal",

                    status:
                        despesa.status ||
                        "Pendente"

                };

            });


        const {
            error
        } = await supabaseClient
            .from("despesas")
            .insert(
                registrosParaInserir
            );


        if (error) {

            console.error(
                "❌ Erro durante a migração:",
                error
            );

            return;

        }


        localStorage.setItem(
            MIGRACAO_KEY,
            "true"
        );


        console.log(
            `✅ ${registrosParaInserir.length} despesa(s) migrada(s) para o Supabase.`
        );

    }


    /* =====================================================
       FILTRO DO MÊS
    ====================================================== */

    function despesasDoMes() {

        const mes =
            mesFiltro.value;


        return despesas.filter(
            function (despesa) {

                return (
                    despesa.data &&
                    despesa.data.startsWith(
                        mes
                    )
                );

            }
        );

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


        registros.forEach(
            function (despesa) {

                const valorDespesa =
                    Number(
                        despesa.valor
                    ) || 0;


                total +=
                    valorDespesa;


                if (
                    despesa.tipo ===
                    "Fixa"
                ) {

                    fixas +=
                        valorDespesa;

                }


                if (
                    despesa.tipo ===
                    "Variável"
                ) {

                    variaveis +=
                        valorDespesa;

                }


                if (
                    despesa.tipo ===
                    "Investimento"
                ) {

                    investimentos +=
                        valorDespesa;

                }

            }
        );


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


        registros.forEach(
            function (despesa) {

                const nomeCategoria =
                    despesa.categoria ||
                    "Outros";


                if (
                    !categorias[
                        nomeCategoria
                    ]
                ) {

                    categorias[
                        nomeCategoria
                    ] = 0;

                }


                categorias[
                    nomeCategoria
                ] +=
                    Number(
                        despesa.valor
                    ) || 0;

            }
        );


        const entradas =
            Object.entries(
                categorias
            );


        if (
            entradas.length === 0
        ) {

            categoriasResumo.innerHTML = `

                <div class="empty-state">

                    <span>
                        Nenhuma despesa registrada.
                    </span>

                </div>

            `;

            return;

        }


        entradas.sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


        const total =
            entradas.reduce(
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


        categoriasResumo.innerHTML =
            "";


        entradas.forEach(
            function (item) {

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
                            ${escaparHTML(nome)}
                        </span>

                        <strong>
                            ${moeda(valorCategoria)}
                        </strong>

                    </div>

                    <div class="category-bar">

                        <span
                            style="width: ${Math.min(
                                100,
                                percentual
                            )}%"
                        ></span>

                    </div>

                    <span class="category-percent">

                        ${percentual.toFixed(1)}% das despesas

                    </span>

                `;


                categoriasResumo.appendChild(
                    elemento
                );

            }
        );

    }


    /* =====================================================
       BADGES
    ====================================================== */

    function classeTipo(tipoDespesa) {

        if (
            tipoDespesa ===
            "Fixa"
        ) {

            return "badge badge-fixed";

        }


        if (
            tipoDespesa ===
            "Investimento"
        ) {

            return "badge badge-investment";

        }


        return "badge badge-variable";

    }


    function classeStatus(statusDespesa) {

        if (
            statusDespesa ===
            "Pago"
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


        if (
            registros.length === 0
        ) {

            emptyTable.style.display =
                "block";

            return;

        }


        emptyTable.style.display =
            "none";


        registros.sort(
            function (a, b) {

                return (
                    new Date(b.data) -
                    new Date(a.data)
                );

            }
        );


        registros.forEach(
            function (despesa) {

                const linha =
                    document.createElement(
                        "tr"
                    );


                linha.innerHTML = `

                    <td>
                        ${formatarData(
                            despesa.data
                        )}
                    </td>

                    <td>
                        <strong>
                            ${escaparHTML(
                                despesa.descricao
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escaparHTML(
                            despesa.categoria
                        )}
                    </td>

                    <td>

                        <span class="${classeTipo(
                            despesa.tipo
                        )}">

                            ${escaparHTML(
                                despesa.tipo
                            )}

                        </span>

                    </td>

                    <td>
                        ${escaparHTML(
                            despesa.pagador
                        )}
                    </td>

                    <td>

                        <span class="${classeStatus(
                            despesa.status
                        )}">

                            ${escaparHTML(
                                despesa.status
                            )}

                        </span>

                    </td>

                    <td class="value-cell">

                        ${moeda(
                            despesa.valor
                        )}

                    </td>

                    <td>

                        <button
                            class="delete-button"
                            data-id="${escaparHTML(
                                despesa.id
                            )}"
                            title="Excluir despesa"
                        >
                            ×
                        </button>

                    </td>

                `;


                listaDespesas.appendChild(
                    linha
                );

            }
        );

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
       ADICIONAR DESPESA
    ====================================================== */

    form.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const novaDespesa = {

                casal_id:
                    casalId,

                descricao:
                    descricao.value.trim(),

                valor:
                    Number(
                        valor.value
                    ) || 0,

                data:
                    data.value,

                categoria:
                    categoria.value,

                tipo:
                    tipo.value,

                pagador:
                    pagador.value,

                status:
                    status.value ||
                    "Pendente"

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


            const botaoSubmit =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (botaoSubmit) {

                botaoSubmit.disabled =
                    true;

                botaoSubmit.textContent =
                    "Salvando...";

            }


            const {
                data: despesaInserida,
                error
            } = await supabaseClient
                .from("despesas")
                .insert(
                    novaDespesa
                )
                .select()
                .single();


            if (error) {

                console.error(
                    "❌ Erro ao salvar despesa:",
                    error
                );


                alert(
                    "Não foi possível salvar a despesa."
                );


                if (botaoSubmit) {

                    botaoSubmit.disabled =
                        false;

                    botaoSubmit.textContent =
                        "Adicionar";

                }


                return;

            }


            console.log(
                "✅ Despesa salva no Supabase:",
                despesaInserida
            );


            despesas.unshift(
                despesaInserida
            );


            atualizarTela();


            form.reset();


            data.value =
                dataAtual();


            if (botaoSubmit) {

                botaoSubmit.disabled =
                    false;

                botaoSubmit.textContent =
                    "Adicionar";

            }

        }
    );


    /* =====================================================
       EXCLUIR DESPESA
    ====================================================== */

    listaDespesas.addEventListener(
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
                    "Deseja excluir esta despesa?"
                );


            if (!confirmar) {
                return;
            }


            botao.disabled =
                true;


            const {
                error
            } = await supabaseClient
                .from("despesas")
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
                    "❌ Erro ao excluir despesa:",
                    error
                );


                alert(
                    "Não foi possível excluir a despesa."
                );


                botao.disabled =
                    false;

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


            atualizarTela();


            console.log(
                "✅ Despesa excluída."
            );

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
       INICIALIZAÇÃO
    ====================================================== */

    data.value =
        dataAtual();


    mesFiltro.value =
        dataAtual().slice(
            0,
            7
        );


    /* =====================================================
       CARREGAR CASAL
    ====================================================== */

    const casalCarregado =
        await carregarCasal();


    if (!casalCarregado) {

        return;

    }


    /* =====================================================
       MIGRAÇÃO
    ====================================================== */

    await migrarDespesas();


    /* =====================================================
       CARREGAR DADOS DO SUPABASE
    ====================================================== */

    const carregou =
        await carregarDespesasSupabase();


    if (!carregou) {

        return;

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    atualizarTela();


});