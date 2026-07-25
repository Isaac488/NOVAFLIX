/*==================================================
=            NOVAFLIX
==================================================*/

console.log("NOVAFLIX iniciado");

/*==================================================
=            VARIABLES GLOBALES
==================================================*/

let tiempoToken = 5;
let ultimaActividad = Date.now();

let controlSesionActivo = false;
let refreshTimeout = null;

/*==================================================
=            INICIALIZACIÓN GENERAL
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    inicializarNovaFlix
);

/**
 * Inicializa todos los módulos disponibles.
 */
function inicializarNovaFlix(){

    iniciarTMDB();

    iniciarControlSesion();

    iniciarCatalogo();

    iniciarBuscadorGlobal();

}

/*==================================================
=            TMDB
==================================================*/

/*----------- Inicialización -----------*/

function iniciarTMDB() {

    const botonBusqueda =
        document.getElementById(
            "tmdb-search-btn"
        );

    if (!botonBusqueda) {
        return;
    }

    botonBusqueda.addEventListener(
        "click",
        buscarTMDB
    );

}

/*----------- Búsqueda -----------*/

async function buscarTMDB() {

    const input =
        document.getElementById(
            "tmdb-query"
        );

    if (!input) {
        return;
    }

    const query =
        input.value.trim();

    if (!query) {
        return;
    }

    const resultados =
        document.getElementById(
            "tmdb-results"
        );

    if (!resultados) {
        return;
    }

    resultados.innerHTML =
        "<p>Buscando películas...</p>";

    try {

        const response =
            await fetch(
                `/api/tmdb/buscar?q=${encodeURIComponent(query)}`
            );

        const data =
            await response.json();

        resultados.innerHTML = "";

        if (!data.results.length) {

            resultados.innerHTML =
                "<p>No se encontraron resultados.</p>";

            return;

        }

        data.results.forEach(
            pelicula => {

                resultados.appendChild(
                    crearTarjetaTMDB(
                        pelicula
                    )
                );

            }
        );

        registrarBotonesImportacion();

    }

    catch (error) {

        console.error(
            "Error TMDB:",
            error
        );

    }

}

/*----------- Importación -----------*/

async function importarTMDB(id) {

    try {

        const response =
            await fetch(
                `/api/tmdb/detalle/${id}`
            );

        const pelicula =
            await response.json();

        document.getElementById(
            "titulo"
        ).value =
            pelicula.title || "";

        document.getElementById(
            "descripcion"
        ).value =
            pelicula.overview || "";

        document.getElementById(
            "poster"
        ).value =
            pelicula.poster_path
                ? `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`
                : "";

        document.getElementById(
            "backdrop"
        ).value =
            pelicula.backdrop_path
                ? `https://image.tmdb.org/t/p/original${pelicula.backdrop_path}`
                : "";

        document.getElementById(
            "anio"
        ).value =
            pelicula.release_date
                ? pelicula.release_date.substring(0, 4)
                : "";

        document.getElementById(
            "duracion"
        ).value =
            pelicula.runtime || "";

        document.getElementById(
            "calificacion"
        ).value =
            pelicula.vote_average || "";

        actualizarVistaPoster(
            pelicula
        );

    }

    catch (error) {

        console.error(error);

        alert(
            "Error al importar película."
        );

    }

}

/*----------- Auxiliares -----------*/

function crearTarjetaTMDB(pelicula) {

    const year =
        pelicula.release_date
            ? pelicula.release_date.substring(0, 4)
            : "N/A";

    const card =
        document.createElement(
            "div"
        );

    card.classList.add(
        "tmdb-card"
    );

    card.innerHTML = `
        <strong>${pelicula.title}</strong>
        (${year})
        <br>
        <button
            class="btn btn-danger btn-sm mt-2 tmdb-import-btn"
            data-id="${pelicula.id}">
            Importar
        </button>
    `;

    return card;

}

function registrarBotonesImportacion() {

    document
        .querySelectorAll(
            ".tmdb-import-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    () => importarTMDB(
                        boton.dataset.id
                    )
                );

            }
        );

}

function actualizarVistaPoster(pelicula) {

    const preview =
        document.getElementById(
            "poster-preview"
        );

    if (
        !preview ||
        !pelicula.poster_path
    ) {
        return;
    }

    preview.src =
        `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;

    preview.style.display =
        "block";

}

/*==================================================
=            CONTROL DE SESIÓN
==================================================*/

/*----------- Eventos de actividad -----------*/

[
    "click",
    "keydown",
    "mousemove",
    "scroll",
    "touchstart"
].forEach(evento => {

    document.addEventListener(
        evento,
        registrarActividad,
        {
            passive: true
        }
    );

});

/*----------- Gestión de actividad -----------*/

/**
 * Registra la última interacción del usuario
 * y programa una renovación del token.
 */
function registrarActividad() {

    if (!controlSesionActivo) {
        return;
    }

    ultimaActividad = Date.now();

    clearTimeout(
        refreshTimeout
    );

    refreshTimeout = setTimeout(
        renovarToken,
        1000
    );

}

/*----------- Configuración -----------*/

/**
 * Obtiene desde el servidor el tiempo máximo
 * permitido de inactividad.
 */
async function cargarTiempoToken() {

    try {

        const response =
            await fetch(
                "/admin/api/configuracion/token"
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        tiempoToken =
            parseInt(
                data.tiempo_token
            ) || 5;

    }

    catch (error) {

        console.error(
            "No fue posible cargar la configuración:",
            error
        );

    }

}

/*----------- Renovación -----------*/

/**
 * Renueva el token de sesión del usuario.
 */
async function renovarToken() {

    if (!controlSesionActivo) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/refresh-token",
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            return;
        }

        ultimaActividad = Date.now();

    }

    catch (error) {

        console.error(
            "Error renovando sesión:",
            error
        );

    }

}

/*----------- Verificación -----------*/

/**
 * Comprueba si la sesión sigue siendo válida
 * y redirige cuando el tiempo de inactividad
 * supera el límite configurado.
 */
async function verificarSesion() {

    if (!controlSesionActivo) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/session-status"
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        if (!data.autenticado) {

            controlSesionActivo = false;
            return;

        }

        if (data.rol === "admin") {

            controlSesionActivo = false;
            return;

        }

        const minutosInactivo =
            (Date.now() - ultimaActividad)
            / 1000
            / 60;

        if (
            minutosInactivo >= tiempoToken
        ) {

            window.location.href =
                "/session-expired";

        }

    }

    catch (error) {

        console.error(
            "Error verificando sesión:",
            error
        );

    }

}

/*----------- Inicialización -----------*/

/**
 * Activa el sistema de control de sesión
 * únicamente para usuarios autenticados
 * que no sean administradores.
 */
async function iniciarControlSesion() {

    try {

        const response =
            await fetch(
                "/api/session-status"
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        if (
            !data.autenticado ||
            data.rol === "admin"
        ) {
            return;
        }

        controlSesionActivo = true;

        ultimaActividad = Date.now();

        await cargarTiempoToken();

        iniciarMonitorSesion();

    }

    catch (error) {

        console.error(error);

    }

}

/*----------- Monitor -----------*/

/**
 * Inicia el monitoreo periódico
 * del estado de la sesión.
 */
function iniciarMonitorSesion() {

    setInterval(
        verificarSesion,
        30000
    );

}

/*==================================================
=            CATÁLOGO NOVAFLIX
==================================================*/


/*----------- Variables del módulo -----------*/

let catalogGrid;
let catalogCards = [];

let filteredCards = [];

let alphabetButtons;

let sortSelect;
let yearFilter;
let categoryFilter;
let durationFilter;
let ratingFilter;
let featuredFilter;
let resetButton;

let pagination;
let showingLabel;
let totalLabel;

let searchQuery = "";

const ITEMS_PER_PAGE = 20;

let currentPage = 1;
let currentLetter = "ALL";

/*----------- Inicialización -----------*/

function iniciarCatalogo() {

    catalogGrid =
        document.getElementById(
            "catalog-grid"
        );

    if (!catalogGrid) {
        return;
    }

    obtenerElementosCatalogo();

    registrarEventosCatalogo();

    filteredCards = [
        ...catalogCards
    ];

    aplicarFiltros();

}

/*----------- Obtención de elementos -----------*/

function obtenerElementosCatalogo() {

    catalogCards = [
        ...document.querySelectorAll(
            ".catalog-item"
        )
    ];

    alphabetButtons =
        document.querySelectorAll(
            ".quick-filter-btn"
        );

    sortSelect =
        document.getElementById(
            "catalog-sort"
        );

    yearFilter =
        document.getElementById(
            "filter-year"
        );

    categoryFilter =
        document.getElementById(
            "filter-category"
        );

    durationFilter =
        document.getElementById(
            "filter-duration"
        );

    ratingFilter =
        document.getElementById(
            "filter-rating"
        );

    featuredFilter =
        document.getElementById(
            "filter-featured"
        );

    resetButton =
        document.getElementById(
            "catalog-reset"
        );

    pagination =
        document.getElementById(
            "catalog-pagination"
        );

    showingLabel =
        document.getElementById(
            "catalog-showing"
        );

    totalLabel =
        document.getElementById(
            "catalog-results"
        );

}

/*----------- Filtros -----------*/

function aplicarFiltros() {

    filteredCards = catalogCards.filter(card => {

        const letter =
            card.dataset.letter;

        const year =
            card.dataset.year;

        const rating =
            parseFloat(
                card.dataset.rating || 0
            );

        const duration =
            parseInt(
                card.dataset.duration || 0
            );

        const categories =
            card.dataset.category || "";

        const featured =
            card.dataset.featured === "1";

        const title =
            (card.dataset.title || "")
                .toLowerCase();

        /*----- Búsqueda por texto -----*/

        if (
            searchQuery &&
            !title.includes(searchQuery)
        ) {
            return false;
        }
        
        /*----- Filtro por letra -----*/

        if (
            currentLetter !== "ALL" &&
            currentLetter !== "#" &&
            letter !== currentLetter
        ) {
            return false;
        }

        if (
            currentLetter === "#" &&
            /^[A-Z]/.test(letter)
        ) {
            return false;
        }

        /*----- Año -----*/

        if (
            yearFilter.value &&
            year !== yearFilter.value
        ) {
            return false;
        }

        /*----- Categoría -----*/

        if (
            categoryFilter.value &&
            !categories.includes(
                categoryFilter.value
            )
        ) {
            return false;
        }

        /*----- Calificación -----*/

        if (
            ratingFilter.value &&
            rating < Number(
                ratingFilter.value
            )
        ) {
            return false;
        }

        /*----- Destacadas -----*/

        if (
            featuredFilter.checked &&
            !featured
        ) {
            return false;
        }

        /*----- Duración -----*/

        if (durationFilter.value) {

            switch (durationFilter.value) {

                case "short":

                    if (duration >= 90) {
                        return false;
                    }

                    break;

                case "medium":

                    if (
                        duration < 90 ||
                        duration > 120
                    ) {
                        return false;
                    }

                    break;

                case "long":

                    if (duration <= 120) {
                        return false;
                    }

                    break;

            }

        }

        return true;

    });

    ordenarCatalogo();

}

/*----------- Ordenamiento -----------*/

function ordenarCatalogo() {

    switch (sortSelect.value) {

        case "title-asc":

            filteredCards.sort((a, b) =>
                a.dataset.title.localeCompare(
                    b.dataset.title
                )
            );

            break;

        case "title-desc":

            filteredCards.sort((a, b) =>
                b.dataset.title.localeCompare(
                    a.dataset.title
                )
            );

            break;

        case "year-desc":

            filteredCards.sort((a, b) =>
                Number(b.dataset.year) -
                Number(a.dataset.year)
            );

            break;

        case "year-asc":

            filteredCards.sort((a, b) =>
                Number(a.dataset.year) -
                Number(b.dataset.year)
            );

            break;

        case "rating-desc":

            filteredCards.sort((a, b) =>
                Number(b.dataset.rating) -
                Number(a.dataset.rating)
            );

            break;

        case "rating-asc":

            filteredCards.sort((a, b) =>
                Number(a.dataset.rating) -
                Number(b.dataset.rating)
            );

            break;

    }

    renderizarPagina();

}

/*----------- Renderizado -----------*/

function renderizarPagina() {

    catalogCards.forEach(card => {

        card.style.display = "none";

    });

    const inicio =
        (currentPage - 1) * ITEMS_PER_PAGE;

    const fin =
        inicio + ITEMS_PER_PAGE;

    filteredCards
        .slice(inicio, fin)
        .forEach(card => {

            card.style.display = "block";

        });

    if (showingLabel) {

        showingLabel.textContent =
            filteredCards.length;

    }

    if (totalLabel) {

        totalLabel.textContent =
            catalogCards.length;

    }

    renderizarPaginacion();

}

/*----------- Paginación -----------*/

function renderizarPaginacion() {

    if (!pagination) {
        return;
    }

    pagination.innerHTML = "";

    const totalPages = Math.ceil(
        filteredCards.length /
        ITEMS_PER_PAGE
    );

    if (totalPages <= 1) {
        return;
    }

    for (let i = 1; i <= totalPages; i++) {

        const li =
            document.createElement("li");

        li.className =
            "page-item" +
            (i === currentPage
                ? " active"
                : "");

        li.innerHTML = `
            <button class="page-link">
                ${i}
            </button>
        `;

        li.addEventListener("click", () => {

            currentPage = i;

            renderizarPagina();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        pagination.appendChild(li);

    }

}

/*----------- Eventos -----------*/

function registrarEventosCatalogo() {

    alphabetButtons.forEach(btn => {

        btn.addEventListener("click", () => {

            alphabetButtons.forEach(b =>
                b.classList.remove("active")
            );

            btn.classList.add("active");

            currentLetter =
                btn.dataset.letter;

            currentPage = 1;

            aplicarFiltros();

        });

    });

    sortSelect?.addEventListener(
        "change",
        actualizarFiltros
    );

    yearFilter?.addEventListener(
        "change",
        actualizarFiltros
    );

    categoryFilter?.addEventListener(
        "change",
        actualizarFiltros
    );

    durationFilter?.addEventListener(
        "change",
        actualizarFiltros
    );

    ratingFilter?.addEventListener(
        "change",
        actualizarFiltros
    );

    featuredFilter?.addEventListener(
        "change",
        actualizarFiltros
    );

    resetButton?.addEventListener(
        "click",
        reiniciarFiltros
    );

}

/*----------- Actualización -----------*/

function actualizarFiltros() {

    currentPage = 1;

    aplicarFiltros();

}

/*----------- Reinicio -----------*/

function reiniciarFiltros() {

    currentLetter = "ALL";

    currentPage = 1;

    sortSelect.value = "title-asc";

    yearFilter.value = "";

    categoryFilter.value = "";

    durationFilter.value = "";

    ratingFilter.value = "";

    featuredFilter.checked = false;

    alphabetButtons.forEach(btn =>
        btn.classList.remove("active")
    );

    document
        .querySelector(
            '.quick-filter-btn[data-letter="ALL"]'
        )
        ?.classList.add("active");

    aplicarFiltros();

}

/*==================================================
=            BUSCADOR GLOBAL NAVBAR
==================================================*/


/*----------- Inicialización -----------*/

function iniciarBuscadorGlobal() {

    const form =
        document.getElementById(
            "navbar-search-form"
        );

    if (!form) {
        return;
    }

    const input =
        document.getElementById(
            "navbar-search"
        );

    const suggestions =
        document.getElementById(
            "navbar-search-results"
        );

    const isCatalog =
        window.location.pathname ===
        "/catalogo";

    input.value = obtenerBusquedaActual();

    registrarEventosBuscador(
        form,
        input,
        suggestions,
        isCatalog
    );

    if (isCatalog) {

        aplicarBusquedaCatalogo();

    }

}

/*----------- Utilidades -----------*/

function obtenerBusquedaActual() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return (
        params.get("buscar") || ""
    );

}

/*----------- Eventos -----------*/

function registrarEventosBuscador(
    form,
    input,
    suggestions,
    isCatalog
) {

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const value =
                input.value.trim();

            if (!value) {

                input.focus();

                return;

            }

            if (isCatalog) {

                const url =
                    new URL(
                        window.location
                    );

                url.searchParams.set(
                    "buscar",
                    value
                );

                window.location.href =
                    url.toString();

            }
            else {

                window.location.href =
                    "/catalogo?buscar=" +
                    encodeURIComponent(
                        value
                    );

            }

        }
    );

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                form.requestSubmit();

            }

        }
    );

    document.addEventListener(
        "click",
        event => {

            if (
                !form.contains(
                    event.target
                )
            ) {

                suggestions?.classList.add(
                    "d-none"
                );

            }

        }
    );

}

/*----------- Integración catálogo -----------*/

function aplicarBusquedaCatalogo() {

    searchQuery =
        obtenerBusquedaActual()
            .toLowerCase()
            .trim();

    if (!catalogGrid) {
        return;
    }

    currentPage = 1;

    aplicarFiltros();

}