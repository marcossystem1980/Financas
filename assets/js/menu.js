document.addEventListener("DOMContentLoaded", function () {


    /*
    ========================================================
    MENU DROPDOWN
    ========================================================
    */

    const groupButtons =
        document.querySelectorAll(
            ".menu-group-button"
        );


    groupButtons.forEach(function (button) {


        button.addEventListener(
            "click",
            function () {


                const menuId =
                    button.dataset.menu;


                const submenu =
                    document.getElementById(
                        menuId
                    );


                if (!submenu) {
                    return;
                }


                /*
                Abre ou fecha o submenu
                */

                submenu.classList.toggle(
                    "open"
                );


                button.classList.toggle(
                    "open"
                );


            }
        );


    });



    /*
    ========================================================
    MENU MOBILE
    ========================================================
    */

    const mobileMenuButton =
        document.getElementById(
            "mobileMenuButton"
        );


    const mobileCloseButton =
        document.getElementById(
            "mobileCloseButton"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const sidebarOverlay =
        document.getElementById(
            "sidebarOverlay"
        );



    /*
    Abrir menu
    */

    function openMobileMenu() {

        sidebar.classList.add(
            "mobile-open"
        );

        sidebarOverlay.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }



    /*
    Fechar menu
    */

    function closeMobileMenu() {

        sidebar.classList.remove(
            "mobile-open"
        );

        sidebarOverlay.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

    }



    /*
    Botão hamburger
    */

    mobileMenuButton.addEventListener(
        "click",
        openMobileMenu
    );


    /*
    Botão X
    */

    mobileCloseButton.addEventListener(
        "click",
        closeMobileMenu
    );


    /*
    Clicar fora do menu
    */

    sidebarOverlay.addEventListener(
        "click",
        closeMobileMenu
    );


    /*
    Clicar em um link fecha
    o menu no celular
    */

    const menuLinks =
        document.querySelectorAll(
            ".menu-item, .submenu-item"
        );


    menuLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 700
                ) {

                    closeMobileMenu();

                }

            }
        );

    });


});