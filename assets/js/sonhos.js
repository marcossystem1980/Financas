document.addEventListener("DOMContentLoaded", async function () {


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_sonhos";


    const MIGRACAO_KEY =
        "financasCasal_sonhos_migrado";


    const BUCKET_SONHOS =
        "sonhos";


    let sonhos = [];

    let filtroAtual = "todos";

    let casalId = null;


    /* =====================================================
       ELEMENTOS
    ====================================================== */

    const form =
        document.getElementById(
            "dreamForm"
        );


    const nomeSonho =
        document.getElementById(
            "nomeSonho"
        );


    const tipoSonho =
        document.getElementById(
            "tipoSonho"
        );


    const valorSonhoInput =
        document.getElementById(
            "valorSonhoInput"
        );


    const valorReservadoInput =
        document.getElementById(
            "valorReservadoInput"
        );


    const prioridadeSonho =
        document.getElementById(
            "prioridadeSonho"
        );


    const prazoSonho =
        document.getElementById(
            "prazoSonho"
        );


    const imagemSonho =
        document.getElementById(
            "imagemSonho"
        );


    const descricaoSonho =
        document.getElementById(
            "descricaoSonho"
        );


    const dreamImagePreview =
        document.getElementById(
            "dreamImagePreview"
        );


    const dreamGrid =
        document.getElementById(
            "dreamGrid"
        );


    const ordenacao =
        document.getElementById(
            "ordenacao"
        );


    const sonhosAtivos =
        document.getElementById(
            "sonhosAtivos"
        );


    const valorSonhos =
        document.getElementById(
            "valorSonhos"
        );


    const valorReservado =
        document.getElementById(
            "valorReservado"
        );


    const valorFaltante =
        document.getElementById(
            "valorFaltante"
        );


    const featuredImage =
        document.querySelector(
            ".featured-image"
        );


    const featuredName =
        document.getElementById(
            "featuredName"
        );


    const featuredDescription =
        document.getElementById(
            "featuredDescription"
        );


    const featuredPercent =
        document.getElementById(
            "featuredPercent"
        );


    const featuredBar =
        document.getElementById(
            "featuredBar"
        );


    const scrollNovoSonho =
        document.getElementById(
            "scrollNovoSonho"
        );


    if (!form) {

        console.error(
            "❌ Formulário de sonhos não encontrado."
        );

        return;

    }


    /* =====================================================
       LOCALSTORAGE — SOMENTE MIGRAÇÃO
    ====================================================== */

    function carregarSonhosLocais() {

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
                "❌ Erro ao carregar sonhos antigos:",
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


    function formatarData(data) {

        if (!data) {

            return "Sem prazo";

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
       IDENTIFICAR CASAL
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
       IMAGENS
    ====================================================== */

    function processarImagem(arquivo) {

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

                                const limite =
                                    900;


                                let largura =
                                    imagem.width;


                                let altura =
                                    imagem.height;


                                if (
                                    largura >
                                    limite
                                ) {

                                    const proporcao =
                                        limite /
                                        largura;


                                    largura =
                                        limite;


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
                                        "Imagem inválida."
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
                                "Erro ao ler a imagem."
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
                "Não foi possível preparar a imagem para envio."
            );

        }


        return resposta.blob();

    }


    async function enviarImagem(
        dataUrl,
        sonhoId
    ) {

        if (!dataUrl) {

            return null;

        }


        const blob =
            await dataUrlParaBlob(
                dataUrl
            );


        const caminho =
            `${casalId}/${sonhoId}.jpg`;


        const {
            error
        } = await supabaseClient
            .storage
            .from(BUCKET_SONHOS)
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
            .from(BUCKET_SONHOS)
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
            .from(BUCKET_SONHOS)
            .remove([
                imagemPath
            ]);


        if (error) {

            throw error;

        }

    }


    async function carregarUrlsDasImagens() {

        await Promise.all(
            sonhos.map(
                async function (sonho) {

                    sonho.imagemUrl =
                        await gerarUrlImagem(
                            sonho.imagemPath
                        );

                }
            )
        );

    }


    if (imagemSonho) {

        imagemSonho.addEventListener(
            "change",
            async function () {

                const arquivo =
                    imagemSonho.files[0];


                if (!arquivo) {

                    dreamImagePreview.innerHTML = `
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


                    dreamImagePreview.innerHTML = `
                        <img
                            src="${imagem}"
                            alt="Prévia do sonho"
                        >
                    `;

                } catch (erro) {

                    console.error(
                        "❌ Erro na prévia da imagem:",
                        erro
                    );


                    dreamImagePreview.innerHTML = `
                        <span>
                            Não foi possível carregar a imagem.
                        </span>
                    `;

                }

            }
        );

    }


    /* =====================================================
       CARREGAR SONHOS DO SUPABASE
    ====================================================== */

    async function carregarSonhosSupabase() {

        const {
            data,
            error
        } = await supabaseClient
            .from("sonhos")
            .select(
                `
                id,
                casal_id,
                legacy_id,
                nome,
                tipo,
                valor,
                reservado,
                prioridade,
                prazo,
                imagem_path,
                link,
                descricao,
                concluido,
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
                "❌ Erro ao carregar sonhos:",
                error
            );

            return false;

        }


        sonhos =
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

                        tipo:
                            item.tipo,

                        valor:
                            Number(
                                item.valor
                            ) || 0,

                        reservado:
                            Number(
                                item.reservado
                            ) || 0,

                        prioridade:
                            item.prioridade ||
                            "Sonho",

                        prazo:
                            item.prazo,

                        imagemPath:
                            item.imagem_path ||
                            "",

                        imagemUrl:
                            "",

                        link:
                            item.link ||
                            "",

                        descricao:
                            item.descricao ||
                            "",

                        concluido:
                            Boolean(
                                item.concluido
                            ),

                        criadoEm:
                            item.created_at,

                        atualizadoEm:
                            item.updated_at

                    };

                }
            );


        await carregarUrlsDasImagens();


        console.log(
            `✅ ${sonhos.length} sonho(s) carregado(s).`
        );


        return true;

    }


    /* =====================================================
       MIGRAÇÃO DOS SONHOS ANTIGOS
    ====================================================== */

    async function migrarSonhos() {

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
            carregarSonhosLocais();


        if (
            antigos.length ===
            0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                "ℹ️ Nenhum sonho antigo encontrado para migrar."
            );


            return;

        }


        const {
            data: existentes,
            error: erroExistentes
        } = await supabaseClient
            .from("sonhos")
            .select(
                "id, legacy_id, imagem_path"
            )
            .eq(
                "casal_id",
                casalId
            );


        if (erroExistentes) {

            console.error(
                "❌ Erro ao verificar sonhos existentes:",
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
            "📦 Iniciando migração dos sonhos antigos..."
        );


        let erros = 0;


        for (
            const antigo of antigos
        ) {

            const legacyId =
                String(
                    antigo.id ??
                    criarId()
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

                        tipo:
                            antigo.tipo ||
                            "Outro",

                        valor:
                            Number(
                                antigo.valor
                            ) || 0,

                        reservado:
                            Number(
                                antigo.reservado
                            ) || 0,

                        prioridade:
                            antigo.prioridade ||
                            "Sonho",

                        prazo:
                            antigo.prazo ||
                            null,

                        imagem_path:
                            null,

                        link:
                            antigo.link ||
                            null,

                        descricao:
                            String(
                                antigo.descricao ||
                                ""
                            ).trim(),

                        concluido:
                            Boolean(
                                antigo.concluido
                            ),

                        created_at:
                            antigo.criadoEm ||
                            new Date().toISOString()

                    };


                    const {
                        data: inserido,
                        error: erroInsert
                    } = await supabaseClient
                        .from("sonhos")
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
                   MIGRAR IMAGEM BASE64 ANTIGA
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
                        error: erroImagem
                    } = await supabaseClient
                        .from("sonhos")
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
                    "❌ Erro ao migrar sonho:",
                    antigo,
                    erro
                );

            }

        }


        if (
            erros === 0
        ) {

            localStorage.setItem(
                MIGRACAO_KEY,
                "true"
            );


            console.log(
                `✅ ${antigos.length} sonho(s) migrado(s) para o Supabase.`
            );

        } else {

            console.warn(
                `⚠️ ${erros} sonho(s) apresentaram erro durante a migração. A migração será tentada novamente na próxima abertura.`
            );

        }

    }


    /* =====================================================
       PROGRESSO
    ====================================================== */

    function progresso(sonho) {

        if (
            Number(
                sonho.valor
            ) <= 0
        ) {

            return 0;

        }


        return Math.min(
            100,
            (
                Number(
                    sonho.reservado
                ) /
                Number(
                    sonho.valor
                )
            ) * 100
        );

    }


    /* =====================================================
       PRIORIDADE
    ====================================================== */

    function pesoPrioridade(
        prioridade
    ) {

        const pesos = {

            "Essencial": 1,

            "Desejável": 2,

            "Sonho": 3

        };


        return (
            pesos[prioridade] ||
            99
        );

    }


    function classePrioridade(
        prioridade
    ) {

        if (
            prioridade ===
            "Essencial"
        ) {

            return "priority-badge priority-essential";

        }


        if (
            prioridade ===
            "Desejável"
        ) {

            return "priority-badge priority-desirable";

        }


        return "priority-badge priority-dream";

    }


    /* =====================================================
       FILTRO
    ====================================================== */

    function filtrarSonhos() {

        if (
            filtroAtual ===
            "todos"
        ) {

            return [...sonhos];

        }


        const mapa = {

            viagem:
                "Viagem",

            casa:
                "Casa",

            experiencia:
                "Experiência",

            outro:
                "Outro"

        };


        return sonhos.filter(
            function (sonho) {

                return (
                    sonho.tipo ===
                    mapa[filtroAtual]
                );

            }
        );

    }


    /* =====================================================
       ORDENAÇÃO
    ====================================================== */

    function ordenarSonhos(
        lista
    ) {

        const copia =
            [...lista];


        switch (
            ordenacao?.value
        ) {


            case "progresso":

                copia.sort(
                    function (a, b) {

                        return (
                            progresso(b) -
                            progresso(a)
                        );

                    }
                );

                break;


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


            case "prioridade":

            default:

                copia.sort(
                    function (a, b) {

                        const pA =
                            pesoPrioridade(
                                a.prioridade
                            );


                        const pB =
                            pesoPrioridade(
                                b.prioridade
                            );


                        if (
                            pA !== pB
                        ) {

                            return (
                                pA -
                                pB
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

        const ativos =
            sonhos.filter(
                function (sonho) {

                    return !sonho.concluido;

                }
            );


        const total =
            sonhos.reduce(
                function (
                    soma,
                    sonho
                ) {

                    return (
                        soma +
                        Number(
                            sonho.valor
                        )
                    );

                },
                0
            );


        const reservado =
            sonhos.reduce(
                function (
                    soma,
                    sonho
                ) {

                    return (
                        soma +
                        Math.min(
                            Number(
                                sonho.reservado
                            ),
                            Number(
                                sonho.valor
                            )
                        )
                    );

                },
                0
            );


        const faltante =
            Math.max(
                0,
                total -
                reservado
            );


        if (sonhosAtivos) {

            sonhosAtivos.textContent =
                ativos.length;

        }


        if (valorSonhos) {

            valorSonhos.textContent =
                moeda(
                    total
                );

        }


        if (valorReservado) {

            valorReservado.textContent =
                moeda(
                    reservado
                );

        }


        if (valorFaltante) {

            valorFaltante.textContent =
                moeda(
                    faltante
                );

        }

    }


    /* =====================================================
       SONHO EM DESTAQUE
    ====================================================== */

    function atualizarDestaque() {

        if (
            sonhos.length ===
            0
        ) {

            if (featuredName) {

                featuredName.textContent =
                    "Ainda não temos um sonho cadastrado";

            }


            if (featuredDescription) {

                featuredDescription.textContent =
                    "Adicione um sonho para começar a acompanhar essa conquista.";

            }


            if (featuredPercent) {

                featuredPercent.textContent =
                    "0%";

            }


            if (featuredBar) {

                featuredBar.style.width =
                    "0%";

            }


            if (featuredImage) {

                featuredImage.innerHTML =
                    "<span>♡</span>";

            }


            return;

        }


        const destaque =
            [...sonhos]
                .sort(
                    function (a, b) {

                        return (
                            pesoPrioridade(
                                a.prioridade
                            ) -
                            pesoPrioridade(
                                b.prioridade
                            )
                        );

                    }
                )
                .find(
                    function (sonho) {

                        return !sonho.concluido;

                    }
                ) ||
            sonhos[0];


        const percent =
            progresso(
                destaque
            );


        if (featuredName) {

            featuredName.textContent =
                destaque.nome;

        }


        if (featuredDescription) {

            featuredDescription.textContent =
                destaque.descricao ||
                `${moeda(destaque.reservado)} de ${moeda(destaque.valor)}`;

        }


        if (featuredPercent) {

            featuredPercent.textContent =
                `${percent.toFixed(1)}%`;

        }


        if (featuredBar) {

            featuredBar.style.width =
                `${percent}%`;

        }


        if (featuredImage) {

            if (
                destaque.imagemUrl
            ) {

                featuredImage.innerHTML = `
                    <img
                        src="${destaque.imagemUrl}"
                        alt="${escaparHTML(destaque.nome)}"
                    >
                `;

            } else {

                featuredImage.innerHTML =
                    "<span>♡</span>";

            }

        }

    }


    /* =====================================================
       RENDERIZAR
    ====================================================== */

    function renderizar() {

        let lista =
            filtrarSonhos();


        lista =
            ordenarSonhos(
                lista
            );


        dreamGrid.innerHTML =
            "";


        if (
            lista.length ===
            0
        ) {

            dreamGrid.innerHTML = `
                <div class="empty-dream-state">
                    Nenhum sonho encontrado.
                </div>
            `;

            return;

        }


        lista.forEach(
            function (sonho) {

                const percent =
                    progresso(
                        sonho
                    );


                const concluido =
                    sonho.concluido ||
                    percent >= 100;


                const imagem =
                    sonho.imagemUrl
                        ? `
                            <img
                                src="${sonho.imagemUrl}"
                                alt="${escaparHTML(sonho.nome)}"
                            >
                        `
                        : `
                            <span class="dream-placeholder">
                                ♡
                            </span>
                        `;


                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    `dream-card ${
                        concluido
                            ? "completed"
                            : ""
                    }`;


                card.innerHTML = `

                    <div class="dream-image">

                        ${imagem}

                    </div>


                    <div class="dream-content">


                        <div class="dream-top">

                            <div>

                                <h3 class="dream-title">
                                    ${escaparHTML(sonho.nome)}
                                </h3>

                                <span class="dream-type">
                                    ${escaparHTML(sonho.tipo)}
                                </span>

                            </div>


                            <span
                                class="${classePrioridade(sonho.prioridade)}"
                            >
                                ${escaparHTML(sonho.prioridade)}
                            </span>

                        </div>


                        <div class="dream-price">

                            <span>
                                VALOR ESTIMADO
                            </span>

                            <strong>
                                ${moeda(sonho.valor)}
                            </strong>

                        </div>


                        <div class="dream-progress">

                            <div class="dream-progress-info">

                                <span>
                                    ${moeda(sonho.reservado)} reservado
                                </span>

                                <strong>
                                    ${percent.toFixed(1)}%
                                </strong>

                            </div>


                            <div class="dream-progress-bar">

                                <span
                                    style="width: ${percent}%"
                                ></span>

                            </div>

                        </div>


                        ${
                            sonho.prazo
                                ? `
                                    <div class="dream-date">
                                        Objetivo: ${formatarData(sonho.prazo)}
                                    </div>
                                `
                                : ""
                        }


                        <div class="dream-actions">

                            <button
                                class="dream-complete-button ${
                                    concluido
                                        ? "completed"
                                        : ""
                                }"
                                data-id="${escaparHTML(sonho.id)}"
                                data-action="concluir"
                            >

                                ${
                                    concluido
                                        ? "✓ Realizado"
                                        : "○ Marcar realizado"
                                }

                            </button>


                            ${
                                sonho.link
                                    ? `
                                        <a
                                            href="${escaparHTML(sonho.link)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="dream-link"
                                        >
                                            ↗
                                        </a>
                                    `
                                    : `
                                        <span></span>
                                    `
                            }

                        </div>


                        <button
                            class="dream-delete"
                            data-id="${escaparHTML(sonho.id)}"
                            data-action="excluir"
                        >
                            Excluir sonho
                        </button>


                    </div>

                `;


                dreamGrid.appendChild(
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

        atualizarDestaque();

        renderizar();

    }


    /* =====================================================
       CRIAR SONHO
    ====================================================== */

    form.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const valor =
                Number(
                    valorSonhoInput.value
                );


            const reservado =
                Number(
                    valorReservadoInput.value
                ) || 0;


            const nome =
                nomeSonho.value.trim();


            const tipo =
                tipoSonho.value;


            const prioridade =
                prioridadeSonho.value;


            const prazo =
                prazoSonho.value ||
                null;


            const descricao =
                descricaoSonho.value.trim();


            if (!nome) {

                alert(
                    "Informe o nome do sonho."
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


            if (
                reservado < 0
            ) {

                alert(
                    "O valor reservado não pode ser negativo."
                );

                return;

            }


            if (
                reservado > valor
            ) {

                alert(
                    "O valor reservado não pode ser maior que o valor do sonho."
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


            let dataUrlImagem =
                "";


            try {

                if (
                    imagemSonho &&
                    imagemSonho.files[0]
                ) {

                    dataUrlImagem =
                        await processarImagem(
                            imagemSonho.files[0]
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

                    tipo:
                        tipo,

                    valor:
                        valor,

                    reservado:
                        reservado,

                    prioridade:
                        prioridade,

                    prazo:
                        prazo,

                    imagem_path:
                        null,

                    link:
                        null,

                    descricao:
                        descricao ||
                        null,

                    concluido:
                        false

                };


                const {
                    data: sonhoInserido,
                    error: erroInsert
                } = await supabaseClient
                    .from("sonhos")
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
                            error: erroImagem
                        } = await supabaseClient
                            .from("sonhos")
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
                    erroImagemUpload
                ) {

                    console.error(
                        "❌ Erro ao enviar a imagem:",
                        erroImagemUpload
                    );


                    await supabaseClient
                        .from("sonhos")
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
                        "Não foi possível enviar a imagem. O sonho não foi salvo."
                    );

                }


                const sonhoLocal = {

                    id:
                        sonhoInserido.id,

                    casalId:
                        sonhoInserido.casal_id,

                    legacyId:
                        sonhoInserido.legacy_id,

                    nome:
                        sonhoInserido.nome,

                    tipo:
                        sonhoInserido.tipo,

                    valor:
                        Number(
                            sonhoInserido.valor
                        ) || 0,

                    reservado:
                        Number(
                            sonhoInserido.reservado
                        ) || 0,

                    prioridade:
                        sonhoInserido.prioridade,

                    prazo:
                        sonhoInserido.prazo,

                    imagemPath:
                        imagemPath ||
                        sonhoInserido.imagem_path ||
                        "",

                    imagemUrl:
                        "",

                    link:
                        sonhoInserido.link ||
                        "",

                    descricao:
                        sonhoInserido.descricao ||
                        "",

                    concluido:
                        Boolean(
                            sonhoInserido.concluido
                        ),

                    criadoEm:
                        sonhoInserido.created_at,

                    atualizadoEm:
                        sonhoInserido.updated_at

                };


                if (
                    sonhoLocal.imagemPath
                ) {

                    sonhoLocal.imagemUrl =
                        await gerarUrlImagem(
                            sonhoLocal.imagemPath
                        );

                }


                sonhos.unshift(
                    sonhoLocal
                );


                atualizarTela();


                form.reset();


                if (
                    valorReservadoInput
                ) {

                    valorReservadoInput.value =
                        0;

                }


                if (
                    dreamImagePreview
                ) {

                    dreamImagePreview.innerHTML = `
                        <span>
                            A imagem escolhida aparecerá aqui.
                        </span>
                    `;

                }


                alert(
                    "Sonho salvo com sucesso."
                );


                console.log(
                    "✅ Sonho salvo no Supabase:",
                    sonhoInserido
                );

            } catch (erro) {

                console.error(
                    "❌ Erro ao salvar sonho:",
                    erro
                );


                alert(
                    erro?.message ===
                    "Não foi possível enviar a imagem. O sonho não foi salvo."
                        ? erro.message
                        : "Não foi possível salvar o sonho."
                );

            } finally {

                if (botao) {

                    botao.disabled =
                        false;

                    botao.textContent =
                        "Adicionar sonho";

                }

            }

        }
    );


    /* =====================================================
       AÇÕES
    ====================================================== */

    dreamGrid.addEventListener(
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


            const sonho =
                sonhos.find(
                    function (item) {

                        return (
                            item.id ===
                            id
                        );

                    }
                );


            if (!sonho) {

                return;

            }


            /* -----------------------------------------
               CONCLUIR / DESFAZER
            ------------------------------------------ */

            if (
                acao === "concluir"
            ) {

                botao.disabled =
                    true;


                const novoStatus =
                    !sonho.concluido;


                const {
                    data: sonhoAtualizado,
                    error
                } = await supabaseClient
                    .from("sonhos")
                    .update({
                        concluido:
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
                        "❌ Erro ao atualizar sonho:",
                        error
                    );


                    alert(
                        "Não foi possível atualizar o sonho."
                    );


                    botao.disabled =
                        false;

                    return;

                }


                sonho.concluido =
                    Boolean(
                        sonhoAtualizado.concluido
                    );


                atualizarTela();


                console.log(
                    "✅ Status do sonho atualizado."
                );


                return;

            }


            /* -----------------------------------------
               EXCLUIR
            ------------------------------------------ */

            if (
                acao === "excluir"
            ) {

                const confirmar =
                    confirm(
                        "Deseja excluir este sonho?"
                    );


                if (!confirmar) {

                    return;

                }


                botao.disabled =
                    true;


                try {

                    if (
                        sonho.imagemPath
                    ) {

                        await excluirImagem(
                            sonho.imagemPath
                        );

                    }


                    const {
                        error
                    } = await supabaseClient
                        .from("sonhos")
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


                    sonhos =
                        sonhos.filter(
                            function (item) {

                                return (
                                    item.id !==
                                    id
                                );

                            }
                        );


                    atualizarTela();


                    console.log(
                        "✅ Sonho excluído do Supabase."
                    );

                } catch (erro) {

                    console.error(
                        "❌ Erro ao excluir sonho:",
                        erro
                    );


                    alert(
                        "Não foi possível excluir o sonho."
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
            ".dream-filter"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        document
                            .querySelectorAll(
                                ".dream-filter"
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
       NOVO SONHO
    ====================================================== */

    if (scrollNovoSonho) {

        scrollNovoSonho.addEventListener(
            "click",
            function () {

                const alvo =
                    document.getElementById(
                        "novoSonho"
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


    if (!casalCarregado) {

        return;

    }


    await migrarSonhos();


    const carregouSonhos =
        await carregarSonhosSupabase();


    if (!carregouSonhos) {

        return;

    }


    atualizarTela();

});