document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       STORAGE
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_sonhos";


    let sonhos =
        carregarSonhos();


    let filtroAtual =
        "todos";


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


    /* =====================================================
       STORAGE
    ====================================================== */

    function carregarSonhos() {

        const dados =
            localStorage.getItem(
                STORAGE_KEY
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
                "Erro ao carregar sonhos:",
                erro
            );

            return [];

        }

    }


    function salvarSonhos() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(
                sonhos
            )
        );

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
                                        altura *
                                        proporcao;

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
                                        .75
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

                dreamImagePreview.innerHTML = `

                    <span>
                        Não foi possível carregar a imagem.
                    </span>

                `;

            }

        }
    );


    /* =====================================================
       PROGRESSO
    ====================================================== */

    function progresso(sonho) {

        if (
            Number(sonho.valor) <= 0
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
            ordenacao.value
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

                        return a.nome.localeCompare(
                            b.nome,
                            "pt-BR"
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
                                pA - pB
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

                    return (
                        !sonho.concluido
                    );

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


        sonhosAtivos.textContent =
            ativos.length;


        valorSonhos.textContent =
            moeda(total);


        valorReservado.textContent =
            moeda(reservado);


        valorFaltante.textContent =
            moeda(faltante);

    }


    /* =====================================================
       SONHO EM DESTAQUE
    ====================================================== */

    function atualizarDestaque() {

        if (
            sonhos.length === 0
        ) {

            featuredName.textContent =
                "Ainda não temos um sonho cadastrado";


            featuredDescription.textContent =
                "Adicione um sonho para começar a acompanhar essa conquista.";


            featuredPercent.textContent =
                "0%";


            featuredBar.style.width =
                "0%";


            featuredImage.innerHTML =
                "<span>♡</span>";


            return;

        }


        const destaque =
            [...sonhos]
                .sort(
                    function (a, b) {

                        return (
                            pesoPrioridade(a.prioridade) -
                            pesoPrioridade(b.prioridade)
                        );

                    }
                )
                .find(
                    function (sonho) {

                        return (
                            !sonho.concluido
                        );

                    }
                ) ||
                sonhos[0];


        const percent =
            progresso(
                destaque
            );


        featuredName.textContent =
            destaque.nome;


        featuredDescription.textContent =
            destaque.descricao ||
            `${moeda(destaque.reservado)} de ${moeda(destaque.valor)}`;


        featuredPercent.textContent =
            `${percent.toFixed(1)}%`;


        featuredBar.style.width =
            `${percent}%`;


        if (
            destaque.imagem
        ) {

            featuredImage.innerHTML = `

                <img
                    src="${destaque.imagem}"
                    alt="${escaparHTML(destaque.nome)}"
                >

            `;

        } else {

            featuredImage.innerHTML =
                "<span>♡</span>";

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
            lista.length === 0
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
                    sonho.imagem
                        ? `
                            <img
                                src="${sonho.imagem}"
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
                                data-id="${sonho.id}"
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
                            data-id="${sonho.id}"
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


            if (
                valor <= 0
            ) {

                alert(
                    "Informe um valor válido."
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


            let imagem = "";


            if (
                imagemSonho.files[0]
            ) {

                try {

                    imagem =
                        await processarImagem(
                            imagemSonho.files[0]
                        );

                } catch (erro) {

                    alert(
                        "Não foi possível processar a imagem."
                    );

                    return;

                }

            }


            const novoSonho = {

                id:
                    criarId(),

                nome:
                    nomeSonho.value.trim(),

                tipo:
                    tipoSonho.value,

                valor:
                    valor,

                reservado:
                    reservado,

                prioridade:
                    prioridadeSonho.value,

                prazo:
                    prazoSonho.value,

                imagem:
                    imagem,

                descricao:
                    descricaoSonho.value.trim(),

                concluido:
                    false,

                criadoEm:
                    new Date().toISOString()

            };


            sonhos.push(
                novoSonho
            );


            salvarSonhos();


            renderizar();

            atualizarResumo();

            atualizarDestaque();


            form.reset();


            valorReservadoInput.value =
                0;


            dreamImagePreview.innerHTML = `

                <span>
                    A imagem escolhida aparecerá aqui.
                </span>

            `;

        }
    );


    /* =====================================================
       AÇÕES
    ====================================================== */

    dreamGrid.addEventListener(
        "click",
        function (evento) {

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


            if (
                acao === "concluir"
            ) {

                sonhos =
                    sonhos.map(
                        function (sonho) {

                            if (
                                sonho.id ===
                                id
                            ) {

                                sonho.concluido =
                                    !sonho.concluido;

                            }


                            return sonho;

                        }
                    );


                salvarSonhos();

                renderizar();

                atualizarResumo();

                atualizarDestaque();

                return;

            }


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


                sonhos =
                    sonhos.filter(
                        function (sonho) {

                            return (
                                sonho.id !==
                                id
                            );

                        }
                    );


                salvarSonhos();

                renderizar();

                atualizarResumo();

                atualizarDestaque();

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

    ordenacao.addEventListener(
        "change",
        renderizar
    );


    /* =====================================================
       NOVO SONHO
    ====================================================== */

    scrollNovoSonho.addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "novoSonho"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    atualizarResumo();

    atualizarDestaque();

    renderizar();

});