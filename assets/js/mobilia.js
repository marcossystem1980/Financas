document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       CONFIGURAÇÃO
    ====================================================== */

    const STORAGE_KEY =
        "financasCasal_mobilia";


    let itens =
        carregarItens();


    let filtroAtual =
        "todos";


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


    /* =====================================================
       STORAGE
    ====================================================== */

    function carregarItens() {

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
                "Erro ao carregar mobília:",
                erro
            );

            return [];

        }

    }


    function salvarItens() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(itens)
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


    /* =====================================================
       COMPACTAR IMAGEM
       
       Nesta fase estamos usando localStorage.
       Para evitar arquivos muito grandes, a imagem
       é reduzida antes de ser salva.
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


    /* =====================================================
       PREVIEW
    ====================================================== */

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

                imagePreview.innerHTML = `

                    <span>
                        Não foi possível visualizar a imagem.
                    </span>

                `;

            }

        }
    );


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
            ordenacao.value
        ) {


            case "menor":

                copia.sort(
                    function (a, b) {

                        return (
                            a.valor -
                            b.valor
                        );

                    }
                );

                break;


            case "maior":

                copia.sort(
                    function (a, b) {

                        return (
                            b.valor -
                            a.valor
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


        totalItens.textContent =
            itens.length;


        valorTotal.textContent =
            moeda(total);


        valorComprado.textContent =
            moeda(comprado);


        valorFaltante.textContent =
            moeda(faltante);


        percentualCasa.textContent =
            `${percentual.toFixed(1)}%`;


        barraCasa.style.width =
            `${Math.min(
                100,
                percentual
            )}%`;


        progressoTexto.textContent =
            `${moeda(comprado)} de ${moeda(total)}`;

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
                    item.imagem
                        ? `
                            <img
                                src="${item.imagem}"
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
                                data-id="${item.id}"
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
                            data-id="${item.id}"
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
       FORMULÁRIO
    ====================================================== */

    form.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const arquivo =
                imagemItem.files[0];


            let imagem =
                "";


            if (arquivo) {

                try {

                    imagem =
                        await processarImagem(
                            arquivo
                        );

                } catch (erro) {

                    alert(
                        "Não foi possível processar a imagem."
                    );

                    return;

                }

            }


            const novoItem = {

                id:
                    criarId(),

                nome:
                    nomeItem.value.trim(),

                ambiente:
                    ambiente.value,

                valor:
                    Number(
                        valorItem.value
                    ),

                prioridade:
                    prioridade.value,

                link:
                    linkLoja.value.trim(),

                imagem:
                    imagem,

                observacao:
                    observacaoItem.value.trim(),

                comprado:
                    false,

                criadoEm:
                    new Date().toISOString()

            };


            if (
                !novoItem.nome ||
                novoItem.valor <= 0
            ) {

                alert(
                    "Informe o nome e um valor válido."
                );

                return;

            }


            itens.push(
                novoItem
            );


            salvarItens();

            renderizar();

            atualizarResumo();


            form.reset();


            imagePreview.innerHTML = `

                <span>
                    A imagem escolhida aparecerá aqui.
                </span>

            `;

        }
    );


    /* =====================================================
       AÇÕES DOS CARDS
    ====================================================== */

    furnitureGrid.addEventListener(
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
                acao === "comprar"
            ) {

                itens =
                    itens.map(
                        function (item) {

                            if (
                                item.id ===
                                id
                            ) {

                                item.comprado =
                                    !item.comprado;

                            }


                            return item;

                        }
                    );


                salvarItens();

                renderizar();

                atualizarResumo();

                return;

            }


            if (
                acao === "excluir"
            ) {

                const confirmar =
                    confirm(
                        "Deseja excluir este item?"
                    );


                if (!confirmar) {
                    return;
                }


                itens =
                    itens.filter(
                        function (item) {

                            return (
                                item.id !==
                                id
                            );

                        }
                    );


                salvarItens();

                renderizar();

                atualizarResumo();

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

    ordenacao.addEventListener(
        "change",
        renderizar
    );


    /* =====================================================
       NOVO ITEM
    ====================================================== */

    scrollNovoItem.addEventListener(
        "click",
        function () {

            document
                .getElementById(
                    "novoItem"
                )
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


    /* =====================================================
       INICIALIZAÇÃO
    ====================================================== */

    renderizar();

    atualizarResumo();

});