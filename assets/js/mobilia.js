document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_mobilia";


    const MIGRACAO_KEY =
        "financasCasal_mobilia_migrado";


    const BUCKET_MOBILIA =
        "mobilia";


    let itens = [];

    let filtroAtual =
        "todos";

    let casalId =
        null;


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const form =
        document.getElementById(
            "furnitureForm"
        );


    const nomeItem =
        document.getElementById(
            "nomeItem"
        );


    const ambiente =
        document.getElementById(
            "ambiente"
        );


    const valorItem =
        document.getElementById(
            "valorItem"
        );


    const prioridade =
        document.getElementById(
            "prioridade"
        );


    const linkLoja =
        document.getElementById(
            "linkLoja"
        );


    const imagemItem =
        document.getElementById(
            "imagemItem"
        );


    const observacaoItem =
        document.getElementById(
            "observacaoItem"
        );


    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    const furnitureGrid =
        document.getElementById(
            "furnitureGrid"
        );


    const ordenacao =
        document.getElementById(
            "ordenacao"
        );


    const totalItens =
        document.getElementById(
            "totalItens"
        );


    const valorTotal =
        document.getElementById(
            "valorTotal"
        );


    const valorComprado =
        document.getElementById(
            "valorComprado"
        );


    const valorFaltante =
        document.getElementById(
            "valorFaltante"
        );


    const percentualCasa =
        document.getElementById(
            "percentualCasa"
        );


    const barraCasa =
        document.getElementById(
            "barraCasa"
        );


    const progressoTexto =
        document.getElementById(
            "progressoTexto"
        );


    const scrollNovoItem =
        document.getElementById(
            "scrollNovoItem"
        );


    if (!form) {

        console.error(
            "❌ Formulário de mobília não encontrado."
        );

        return;

    }


    /* =====================================================
       LOCALSTORAGE — SOMENTE MIGRAÇÃO
    ====================================================== */

    function carregarItensLocais() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!dados) {

            return [];

        }


        try {

            const resultado =
                JSON.parse(
                    dados
                );


            return Array.isArray(
                resultado
            )
                ? resultado
                : [];

        } catch (erro) {

            console.error(
                "❌ Erro ao carregar mobília antiga:",
                erro
            );

            return [];

        }

    }


    /* =====================================================
       UTILITÁRIOS
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


    function criarId() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
            "function"
        ) {

            return window.crypto.randomUUID();

        }


        return (
            Date.now().toString() +
            Math.random()
                .toString(16)
                .slice(2)
        );

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


    /* =====================================================
       IDENTIFICAR USUÁRIO / CASAL
    ====================================================== */

    async function carregarCasal() {

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
       IMAGEM
    ====================================================== */

    function processarImagem(
        arquivo
    ) {

        return new Promise(
            function (
                resolve,
                reject
            ) {

                if (!arquivo) {

                    resolve("");

                    return;

                }


                const leitor =
                    new FileReader();


                leitor.onload =
                    function () {

                        const imagem =
                            new Image();


                        imagem.onload =
                            function () {

                                const tamanhoMaximo =
                                    900;


                                let largura =
                                    imagem.width;


                                let altura =
                                    imagem.height;


                                if (
                                    largura >
                                    tamanhoMaximo
                                ) {

                                    const proporcao =
                                        tamanhoMaximo /
                                        largura;


                                    largura =
                                        tamanhoMaximo;


                                    altura =
                                        Math.round(
                                            altura *
                                            proporcao
                                        );

                                }


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                canvas.width =
                                    largura;


                                canvas.height =
                                    altura;


                                const contexto =
                                    canvas.getContext(
                                        "2d"
                                    );


                                if (!contexto) {

                                    reject(
                                        new Error(
                                            "Não foi possível preparar a imagem."
                                        )
                                    );

                                    return;

                                }


                                contexto.drawImage(
                                    imagem,
                                    0,
                                    0,
                                    largura,
                                    altura
                                );


                                const resultado =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        0.75
                                    );


                                resolve(
                                    resultado
                                );

                            };


                        imagem.onerror =
                            function () {

                                reject(
                                    new Error(
                                        "Não foi possível processar a imagem."
                                    )
                                );

                            };


                        imagem.src =
                            leitor.result;

                    };


                leitor.onerror =
                    function () {

                        reject(
                            new Error(
                                "Não foi possível ler a imagem."
                            )
                        );

                    };


                leitor.readAsDataURL(
                    arquivo
                );

            }
        );

    }


    async function dataUrlParaBlob(
        dataUrl
    ) {

        const resposta =
            await fetch(
                dataUrl
            );


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível preparar a imagem."
            );

        }


        return resposta.blob();

    }


    async function enviarImagem(
        dataUrl,
        itemId
    ) {

        if (!dataUrl) {

            return null;

        }


        const blob =
            await dataUrlParaBlob(
                dataUrl
            );


        const caminho =
            `${casalId}/${itemId}.jpg`;


        const {
            error
        } = await supabaseClient
            .storage
            .from(BUCKET_MOBILIA)
            .upload(
                caminho,
                blob,
                {
                    contentType:
                        "image/jpeg",

                    upsert:
                        false,

                    cacheControl:
                        "3600"
                }
            );


        if (error) {

            throw error;

        }


        return caminho;

    }


    async function gerarUrlImagem(
        imagemPath
    ) {

        if (!imagemPath) {

            return "";

        }


        const {
            data,
            error
        } = await supabaseClient
            .storage
            .from(BUCKET_MOBILIA)
            .createSignedUrl(
                imagemPath,
                60 * 60 * 24 * 7
            );


        if (error) {

            console.error(
                "❌ Erro ao gerar URL da imagem:",
                error
            );

            return "";

        }


        return (
            data?.signedUrl ||
            ""
        );

    }


    async function excluirImagem(
        imagemPath
    ) {

        if (!imagemPath) {

            return;

        }


        const {
            error
        } = await supabaseClient
            .storage
            .from(BUCKET_MOBILIA)
            .remove([
                imagemPath
            ]);


        if (error) {

            throw error;

        }

    }


    async function carregarUrlsImagens() {

        await Promise.all(
            itens.map(
                async function (item) {

                    item.imagemUrl =
                        await gerarUrlImagem(
                            item.imagemPath
                        );

                }
            )
        );

    }


    /* =====================================================
       PREVIEW DA IMAGEM
    ====================================================== */

    if (imagemItem) {

        imagemItem.addEventListener(
            "change",
            async function () {

                const arquivo =
                    imagemItem.files[0];


                if (!arquivo) {

                    imagePreview.innerHTML = `
                        <span>
                            A imagem escolhida aparecerá aqui.
                        </span>
                    `;

                    return;

                }


                try {

                    const imagem =
                        await processarImagem(
                            arquivo
                        );


                    imagePreview.innerHTML = `
                        <img
                            src="${imagem}"
                            alt="Prévia do item"
                        >
                    `;

                } catch (erro) {

                    console.error(
                        "❌ Erro na prévia da imagem:",
                        erro
                    );


                    imagePreview.innerHTML = `
                        <span>
                            Não foi possível visualizar a imagem.
                        </span>
                    `;

                }

            }
        );

    }


    /* =====================================================
       CARREGAR MOBÍLIA DO SUPABASE
    ====================================================== */

    async function carregarItensSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("mobilia")
            .select(
                `
                id,
                casal_id,
                legacy_id,
                nome,
                ambiente,
                valor,
                prioridade,
                link,
                imagem_path,
                observacao,
                comprado,
                created_at,
                updated_at
                `
            )
            .eq(
                "casal_id",
                casalId
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(
                "❌ Erro ao carregar mobília:",
                error
            );

            return false;

        }


        itens =
            (data || []).map(
                function (item) {

                    return {

                        id:
                            item.id,

                        casalId:
                            item.casal_id,

                        legacyId:
                            item.legacy_id,

                        nome:
                            item.nome,

                        ambiente:
                            item.ambiente,

                        valor:
                            Number(
                                item.valor
                            ) || 0,

                        prioridade:
                            item.prioridade ||
                            "Desejável",

                        link:
                            item.link ||
                            "",

                        imagemPath:
                            item.imagem_path ||
                            "",

                        imagemUrl:
                            "",

                        observacao:
                            item.observacao ||
                            "",

                        comprado:
                            Boolean(
                                item.comprado
                            ),

                        criadoEm:
                            item.created_at,

                        atualizadoEm:
                            item.updated_at

                    };

                }
            );


        await carregarUrlsImagens();


        console.log(
            `✅ ${itens.length} item(ns) de mobília carregado(s).`
        );


        return true;

    }


    /* =====================================================
       MIGRAÇÃO
    ====================================================== */

    async function migrarItens() {

        const jaMigrado =
            localStorage.getItem(
                MIGRACAO_KEY
            );


        if (
            jaMigrado ===
            "true"
        ) {

            return;

        }


        const antigos =
            carregarItensLocais();


        if (
            antigos.length ===
            0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ Nenhum item antigo de mobília encontrado para migrar."
            );


            return;

        }


        const {
            data: existentes,
            error: erroExistentes
        } = await supabaseClient
            .from("mobilia")
            .select(
                "id, legacy_id, imagem_path"
            )
            .eq(
                "casal_id",
                casalId
            );


        if (erroExistentes) {

            console.error(
                "❌ Erro ao verificar mobília existente:",
                erroExistentes
            );

            return;

        }


        const porLegacy =
            new Map();


        (existentes || []).forEach(
            function (item) {

                if (
                    item.legacy_id
                ) {

                    porLegacy.set(
                        String(
                            item.legacy_id
                        ),
                        item
                    );

                }

            }
        );


        console.log(
            "📦 Iniciando migração da mobília antiga..."
        );


        let erros =
            0;


        for (
            let indice = 0;
            indice < antigos.length;
            indice++
        ) {

            const antigo =
                antigos[indice];


            const legacyId =
                String(
                    antigo.id ??
                    `item-${indice}-${antigo.nome || "sem-nome"}`
                );


            let existente =
                porLegacy.get(
                    legacyId
                ) ||
                null;


            try {

                if (!existente) {

                    const novoId =
                        criarId();


                    const registro = {

                        id:
                            novoId,

                        casal_id:
                            casalId,

                        legacy_id:
                            legacyId,

                        nome:
                            String(
                                antigo.nome ||
                                "Sem nome"
                            ).trim(),

                        ambiente:
                            String(
                                antigo.ambiente ||
                                "Outro"
                            ).trim(),

                        valor:
                            Number(
                                antigo.valor
                            ) || 0,

                        prioridade:
                            antigo.prioridade ||
                            "Desejável",

                        link:
                            antigo.link ||
                            null,

                        imagem_path:
                            null,

                        observacao:
                            String(
                                antigo.observacao ||
                                ""
                            ).trim() ||
                            null,

                        comprado:
                            Boolean(
                                antigo.comprado
                            ),

                        created_at:
                            antigo.criadoEm ||
                            new Date().toISOString()

                    };


                    const {
                        data: inserido,
                        error: erroInsert
                    } = await supabaseClient
                        .from("mobilia")
                        .insert(
                            registro
                        )
                        .select(
                            "id, legacy_id, imagem_path"
                        )
                        .single();


                    if (erroInsert) {

                        throw erroInsert;

                    }


                    existente =
                        inserido;


                    porLegacy.set(
                        legacyId,
                        existente
                    );

                }


                /* -----------------------------------------
                   MIGRAR IMAGEM ANTIGA
                ------------------------------------------ */

                if (
                    antigo.imagem &&
                    String(
                        antigo.imagem
                    ).startsWith(
                        "data:image/"
                    ) &&
                    !existente.imagem_path
                ) {

                    const caminho =
                        await enviarImagem(
                            antigo.imagem,
                            existente.id
                        );


                    const {
                        error:
                            erroImagem
                    } = await supabaseClient
                        .from("mobilia")
                        .update({
                            imagem_path:
                                caminho,

                            updated_at:
                                new Date().toISOString()
                        })
                        .eq(
                            "id",
                            existente.id
                        )
                        .eq(
                            "casal_id",
                            casalId
                        );


                    if (erroImagem) {

                        await excluirImagem(
                            caminho
                        );

                        throw erroImagem;

                    }


                    existente.imagem_path =
                        caminho;

                }

            } catch (erro) {

                erros += 1;


                console.error(
                    "❌ Erro ao migrar item de mobília:",
                    antigo,
                    erro
                );

            }

        }


        if (
            erros ===
            0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                `✅ ${antigos.length} item(ns) de mobília migrado(s) para o Supabase.`
            );

        } else {

            console.warn(
                `⚠️ ${erros} item(ns) apresentaram erro durante a migração. A migração será tentada novamente.`
            );

        }

    }


    /* =====================================================
       PRIORIDADE
    ====================================================== */

    function pesoPrioridade(
        prioridadeItem
    ) {

        const pesos = {

            "Essencial": 1,

            "Desejável": 2,

            "Luxo": 3

        };


        return (
            pesos[prioridadeItem] ||
            99
        );

    }


    /* =====================================================
       FILTRO
    ====================================================== */

    function filtrarItens() {

        if (
            filtroAtual ===
            "todos"
        ) {

            return [...itens];

        }


        const mapa = {

            essencial:
                "Essencial",

            desejavel:
                "Desejável",

            luxo:
                "Luxo"

        };


        return itens.filter(
            function (item) {

                return (
                    item.prioridade ===
                    mapa[filtroAtual]
                );

            }
        );

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function ordenarItens(
        lista
    ) {

        const copia =
            [...lista];


        switch (
            ordenacao?.value
        ) {


            case "menor":

                copia.sort(
                    function (a, b) {

                        return (
                            Number(a.valor) -
                            Number(b.valor)
                        );

                    }
                );

                break;


            case "maior":

                copia.sort(
                    function (a, b) {

                        return (
                            Number(b.valor) -
                            Number(a.valor)
                        );

                    }
                );

                break;


            case "nome":

                copia.sort(
                    function (a, b) {

                        return (
                            a.nome.localeCompare(
                                b.nome,
                                "pt-BR"
                            )
                        );

                    }
                );

                break;


            case "status":

                copia.sort(
                    function (a, b) {

                        return (
                            Number(
                                a.comprado
                            ) -
                            Number(
                                b.comprado
                            )
                        );

                    }
                );

                break;


            case "prioridade":

            default:

                copia.sort(
                    function (a, b) {

                        const prioridadeA =
                            pesoPrioridade(
                                a.prioridade
                            );


                        const prioridadeB =
                            pesoPrioridade(
                                b.prioridade
                            );


                        if (
                            prioridadeA !==
                            prioridadeB
                        ) {

                            return (
                                prioridadeA -
                                prioridadeB
                            );

                        }


                        return (
                            a.nome.localeCompare(
                                b.nome,
                                "pt-BR"
                            )
                        );

                    }
                );

                break;

        }


        return copia;

    }


    /* =====================================================
       RESUMO
    ====================================================== */

    function atualizarResumo() {

        const total =
            itens.reduce(
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


        const comprado =
            itens
                .filter(
                    function (item) {

                        return item.comprado;

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


        const faltante =
            Math.max(
                0,
                total -
                comprado
            );


        const percentual =
            total > 0
                ? (
                    comprado /
                    total
                ) * 100
                : 0;


        if (totalItens) {

            totalItens.textContent =
                itens.length;

        }


        if (valorTotal) {

            valorTotal.textContent =
                moeda(total);

        }


        if (valorComprado) {

            valorComprado.textContent =
                moeda(comprado);

        }


        if (valorFaltante) {

            valorFaltante.textContent =
                moeda(faltante);

        }


        if (percentualCasa) {

            percentualCasa.textContent =
                `${percentual.toFixed(1)}%`;

        }


        if (barraCasa) {

            barraCasa.style.width =
                `${Math.min(
                    100,
                    percentual
                )}%`;

        }


        if (progressoTexto) {

            progressoTexto.textContent =
                `${moeda(comprado)} de ${moeda(total)}`;

        }

    }


    /* =====================================================
       BADGE DE PRIORIDADE
    ====================================================== */

    function classePrioridade(
        prioridadeItem
    ) {

        if (
            prioridadeItem ===
            "Essencial"
        ) {

            return "priority-badge priority-essential";

        }


        if (
            prioridadeItem ===
            "Desejável"
        ) {

            return "priority-badge priority-desirable";

        }


        return "priority-badge priority-luxury";

    }


    /* =====================================================
       RENDERIZAR
    ====================================================== */

    function renderizar() {

        const lista =
            ordenarItens(
                filtrarItens()
            );


        furnitureGrid.innerHTML =
            "";


        if (
            lista.length ===
            0
        ) {

            furnitureGrid.innerHTML = `

                <div class="empty-furniture-state">

                    Nenhum item encontrado.

                </div>

            `;

            return;

        }


        lista.forEach(
            function (item) {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    `furniture-card ${
                        item.comprado
                            ? "purchased"
                            : ""
                    }`;


                const imagem =
                    item.imagemUrl
                        ? `
                            <img
                                src="${item.imagemUrl}"
                                alt="${escaparHTML(item.nome)}"
                            >
                        `
                        : `
                            <div class="image-placeholder">

                                <strong>
                                    ♡
                                </strong>

                                <span>
                                    Sem foto
                                </span>

                            </div>
                        `;


                const link =
                    item.link
                        ? `
                            <a
                                href="${escaparHTML(item.link)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="store-button"
                                title="Abrir loja"
                            >
                                ↗
                            </a>
                        `
                        : `
                            <span></span>
                        `;


                card.innerHTML = `

                    <div class="furniture-image">

                        ${imagem}

                    </div>


                    <div class="furniture-content">


                        <div class="furniture-top">

                            <div>

                                <h3 class="furniture-title">
                                    ${escaparHTML(item.nome)}
                                </h3>

                                <span class="furniture-room">
                                    ${escaparHTML(item.ambiente)}
                                </span>

                            </div>


                            <span
                                class="${classePrioridade(item.prioridade)}"
                            >
                                ${escaparHTML(item.prioridade)}
                            </span>

                        </div>


                        <div class="furniture-price">

                            <span>
                                VALOR ESTIMADO
                            </span>

                            <strong>
                                ${moeda(item.valor)}
                            </strong>

                        </div>


                        <div class="furniture-actions">

                            <button
                                class="purchase-button ${
                                    item.comprado
                                        ? "purchased"
                                        : ""
                                }"
                                data-id="${escaparHTML(item.id)}"
                                data-action="comprar"
                            >

                                ${
                                    item.comprado
                                        ? "✓ Comprado"
                                        : "○ Marcar como comprado"
                                }

                            </button>


                            ${link}

                        </div>


                        ${
                            item.observacao
                                ? `
                                    <div class="furniture-observation">

                                        ${escaparHTML(
                                            item.observacao
                                        )}

                                    </div>
                                `
                                : ""
                        }


                        <button
                            class="delete-furniture"
                            data-id="${escaparHTML(item.id)}"
                            data-action="excluir"
                        >
                            Excluir item
                        </button>


                    </div>

                `;


                furnitureGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       ATUALIZAR TELA
    ====================================================== */

    function atualizarTela() {

        atualizarResumo();

        renderizar();

    }


    /* =====================================================
       CRIAR ITEM
    ====================================================== */

    form.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const nome =
                nomeItem.value.trim();


            const ambienteValor =
                ambiente.value;


            const valor =
                Number(
                    valorItem.value
                );


            const prioridadeValor =
                prioridade.value;


            const link =
                linkLoja.value.trim();


            const observacao =
                observacaoItem.value.trim();


            if (!nome) {

                alert(
                    "Informe o nome do item."
                );

                return;

            }


            if (
                valor <= 0
            ) {

                alert(
                    "Informe um valor válido."
                );

                return;

            }


            const botao =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (botao) {

                botao.disabled =
                    true;

                botao.textContent =
                    "Salvando...";

            }


            try {

                let dataUrlImagem =
                    "";


                if (
                    imagemItem &&
                    imagemItem.files[0]
                ) {

                    dataUrlImagem =
                        await processarImagem(
                            imagemItem.files[0]
                        );

                }


                const novoId =
                    criarId();


                const registro = {

                    id:
                        novoId,

                    casal_id:
                        casalId,

                    legacy_id:
                        null,

                    nome:
                        nome,

                    ambiente:
                        ambienteValor ||
                        "Outro",

                    valor:
                        valor,

                    prioridade:
                        prioridadeValor ||
                        "Desejável",

                    link:
                        link ||
                        null,

                    imagem_path:
                        null,

                    observacao:
                        observacao ||
                        null,

                    comprado:
                        false

                };


                const {
                    data: itemInserido,
                    error: erroInsert
                } = await supabaseClient
                    .from("mobilia")
                    .insert(
                        registro
                    )
                    .select()
                    .single();


                if (erroInsert) {

                    throw erroInsert;

                }


                let imagemPath =
                    null;


                try {

                    if (
                        dataUrlImagem
                    ) {

                        imagemPath =
                            await enviarImagem(
                                dataUrlImagem,
                                novoId
                            );


                        const {
                            error:
                                erroImagem
                        } = await supabaseClient
                            .from("mobilia")
                            .update({
                                imagem_path:
                                    imagemPath,

                                updated_at:
                                    new Date().toISOString()
                            })
                            .eq(
                                "id",
                                novoId
                            )
                            .eq(
                                "casal_id",
                                casalId
                            );


                        if (erroImagem) {

                            await excluirImagem(
                                imagemPath
                            );

                            throw erroImagem;

                        }

                    }

                } catch (
                    erroUpload
                ) {

                    console.error(
                        "❌ Erro ao enviar a imagem:",
                        erroUpload
                    );


                    await supabaseClient
                        .from("mobilia")
                        .delete()
                        .eq(
                            "id",
                            novoId
                        )
                        .eq(
                            "casal_id",
                            casalId
                        );


                    throw new Error(
                        "Não foi possível enviar a imagem. O item não foi salvo."
                    );

                }


                const novoItemLocal = {

                    id:
                        itemInserido.id,

                    casalId:
                        itemInserido.casal_id,

                    legacyId:
                        itemInserido.legacy_id,

                    nome:
                        itemInserido.nome,

                    ambiente:
                        itemInserido.ambiente,

                    valor:
                        Number(
                            itemInserido.valor
                        ) || 0,

                    prioridade:
                        itemInserido.prioridade,

                    link:
                        itemInserido.link ||
                        "",

                    imagemPath:
                        imagemPath ||
                        itemInserido.imagem_path ||
                        "",

                    imagemUrl:
                        "",

                    observacao:
                        itemInserido.observacao ||
                        "",

                    comprado:
                        Boolean(
                            itemInserido.comprado
                        ),

                    criadoEm:
                        itemInserido.created_at,

                    atualizadoEm:
                        itemInserido.updated_at

                };


                if (
                    novoItemLocal.imagemPath
                ) {

                    novoItemLocal.imagemUrl =
                        await gerarUrlImagem(
                            novoItemLocal.imagemPath
                        );

                }


                itens.unshift(
                    novoItemLocal
                );


                atualizarTela();


                form.reset();


                if (imagePreview) {

                    imagePreview.innerHTML = `

                        <span>
                            A imagem escolhida aparecerá aqui.
                        </span>

                    `;

                }


                console.log(
                    "✅ Item de mobília salvo no Supabase:",
                    itemInserido
                );

            } catch (erro) {

                console.error(
                    "❌ Erro ao salvar item:",
                    erro
                );


                alert(
                    erro?.message ===
                    "Não foi possível enviar a imagem. O item não foi salvo."
                        ? erro.message
                        : "Não foi possível salvar o item."
                );

            } finally {

                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar item";

                }

            }

        }
    );


    /* =====================================================
       AÇÕES
    ====================================================== */

    furnitureGrid.addEventListener(
        "click",
        async function (evento) {

            const botao =
                evento.target.closest(
                    "[data-action]"
                );


            if (!botao) {

                return;

            }


            const id =
                botao.dataset.id;


            const acao =
                botao.dataset.action;


            const item =
                itens.find(
                    function (registro) {

                        return (
                            registro.id ===
                            id
                        );

                    }
                );


            if (!item) {

                return;

            }


            /* -----------------------------------------
               COMPRAR / DESFAZER COMPRA
            ------------------------------------------ */

            if (
                acao ===
                "comprar"
            ) {

                botao.disabled =
                    true;


                const novoStatus =
                    !item.comprado;


                const {
                    data:
                        itemAtualizado,
                    error
                } = await supabaseClient
                    .from("mobilia")
                    .update({
                        comprado:
                            novoStatus,

                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        id
                    )
                    .eq(
                        "casal_id",
                        casalId
                    )
                    .select()
                    .single();


                if (error) {

                    console.error(
                        "❌ Erro ao atualizar status:",
                        error
                    );


                    alert(
                        "Não foi possível atualizar o status do item."
                    );


                    botao.disabled =
                        false;

                    return;

                }


                item.comprado =
                    Boolean(
                        itemAtualizado.comprado
                    );


                atualizarTela();


                console.log(
                    "✅ Status de compra atualizado."
                );


                return;

            }


            /* -----------------------------------------
               EXCLUIR
            ------------------------------------------ */

            if (
                acao ===
                "excluir"
            ) {

                const confirmar =
                    confirm(
                        "Deseja excluir este item?"
                    );


                if (!confirmar) {

                    return;

                }


                botao.disabled =
                    true;


                try {

                    /* ---------------------------------
                       EXCLUIR PRIMEIRO DO BANCO
                    ---------------------------------- */

                    const {
                        error
                    } = await supabaseClient
                        .from("mobilia")
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

                        throw error;

                    }


                    /* ---------------------------------
                       EXCLUIR IMAGEM
                    ---------------------------------- */

                    if (
                        item.imagemPath
                    ) {

                        try {

                            await excluirImagem(
                                item.imagemPath
                            );

                        } catch (
                            erroImagem
                        ) {

                            console.warn(
                                "⚠️ Item excluído, mas não foi possível excluir a imagem do Storage:",
                                erroImagem
                            );

                        }

                    }


                    itens =
                        itens.filter(
                            function (
                                registro
                            ) {

                                return (
                                    registro.id !==
                                    id
                                );

                            }
                        );


                    atualizarTela();


                    console.log(
                        "✅ Item de mobília excluído."
                    );

                } catch (erro) {

                    console.error(
                        "❌ Erro ao excluir item:",
                        erro
                    );


                    alert(
                        "Não foi possível excluir o item."
                    );


                    botao.disabled =
                        false;

                }

            }

        }
    );


    /* =====================================================
       FILTROS
    ====================================================== */

    document
        .querySelectorAll(
            ".filter-button"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".filter-button"
                            )
                            .forEach(
                                function (
                                    outro
                                ) {

                                    outro.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        botao.classList.add(
                            "active"
                        );


                        filtroAtual =
                            botao.dataset.filter;


                        renderizar();

                    }
                );

            }
        );


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    if (ordenacao) {

        ordenacao.addEventListener(
            "change",
            renderizar
        );

    }


    /* =====================================================
       NOVO ITEM
    ====================================================== */

    if (scrollNovoItem) {

        scrollNovoItem.addEventListener(
            "click",
            function () {

                const alvo =
                    document.getElementById(
                        "novoItem"
                    );


                if (!alvo) {

                    return;

                }


                alvo.scrollIntoView({
                    behavior: "smooth"
                });

            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    const casalCarregado =
        await carregarCasal();


    if (
        !casalCarregado
    ) {

        return;

    }


    await migrarItens();


    const carregouItens =
        await carregarItensSupabase();


    if (
        !carregouItens
    ) {

        return;

    }


    atualizarTela();

});