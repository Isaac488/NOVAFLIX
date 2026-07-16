console.log("NOVAFLIX iniciado");

let tiempoToken = 5;

let ultimaActividad = Date.now();

let controlSesionActivo = false;

let refreshTimeout = null;

document.addEventListener(

    "DOMContentLoaded",

    () => {

        iniciarTMDB();

        iniciarControlSesion();

    }

);

/* ==========================================
   TMDB
========================================== */

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

                const year =

                    pelicula.release_date

                        ? pelicula.release_date.substring(0,4)

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

                        data-id="${pelicula.id}"

                    >

                        Importar

                    </button>

                `;

                resultados.appendChild(card);

            }

        );

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

    catch(error) {

        console.error(

            "Error TMDB:",

            error

        );

    }

}

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

                ? pelicula.release_date.substring(0,4)

                : "";

        document.getElementById(

            "duracion"

        ).value =

            pelicula.runtime || "";

        document.getElementById(

            "calificacion"

        ).value =

            pelicula.vote_average || "";

        const preview =

            document.getElementById(

                "poster-preview"

            );

        if (

            preview &&

            pelicula.poster_path

        ) {

            preview.src =

                `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;

            preview.style.display =

                "block";

        }

    }

    catch(error) {

        console.error(

            error

        );

        alert(

            "Error al importar película."

        );

    }

}

/* ==========================================
   CONTROL DE SESIÓN
========================================== */

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

    catch(error) {

        console.error(

            "No fue posible cargar la configuración:",

            error

        );

    }

}

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

    catch(error) {

        console.error(

            "Error renovando sesión:",

            error

        );

    }

}

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

        if (

            !data.autenticado

        ) {

            controlSesionActivo = false;

            return;

        }

        if (

            data.rol === "admin"

        ) {

            controlSesionActivo = false;

            return;

        }

        const minutosInactivo =

            (

                Date.now()

                -

                ultimaActividad

            )

            / 1000

            / 60;

        if (

            minutosInactivo >= tiempoToken

        ) {

            window.location.href =

                "/session-expired";

        }

    }

    catch(error) {

        console.error(

            "Error verificando sesión:",

            error

        );

    }

}

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

        setInterval(

            verificarSesion,

            30000

        );

    }

    catch(error) {

        console.error(

            error

        );

    }

}

/*==================================================
=            CATÁLOGO NOVAFLIX 2.0
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const grid = document.getElementById("catalog-grid");

    if (!grid) return;

    const cards = [

        ...document.querySelectorAll(".catalog-item")

    ];

    const alphabetButtons = document.querySelectorAll(

        ".alphabet-btn"

    );

    const sortSelect = document.getElementById(

        "catalog-sort"

    );

    const yearFilter = document.getElementById(

        "filter-year"

    );

    const categoryFilter = document.getElementById(

        "filter-category"

    );

    const durationFilter = document.getElementById(

        "filter-duration"

    );

    const ratingFilter = document.getElementById(

        "filter-rating"

    );

    const featuredFilter = document.getElementById(

        "filter-featured"

    );

    const resetButton = document.getElementById(

        "catalog-reset"

    );

    const pagination = document.getElementById(

        "catalog-pagination"

    );

    const showingLabel = document.getElementById(

        "catalog-showing"

    );

    const totalLabel = document.getElementById(

        "catalog-results"

    );

    const ITEMS_PER_PAGE = 20;

    let currentPage = 1;

    let currentLetter = "ALL";

    let filteredCards = [

        ...cards

    ];



    function filterCards(){

        filteredCards = cards.filter(card => {

            const letter = card.dataset.letter;

            const year = card.dataset.year;

            const rating = parseFloat(

                card.dataset.rating || 0

            );

            const duration = parseInt(

                card.dataset.duration || 0

            );

            const categories =

                card.dataset.category || "";

            const featured =

                card.dataset.featured === "1";



            if(

                currentLetter !== "ALL"

                &&

                currentLetter !== "#"

                &&

                letter !== currentLetter

            ){

                return false;

            }



            if(

                currentLetter === "#"

                &&

                /^[A-Z]/.test(letter)

            ){

                return false;

            }



            if(

                yearFilter.value

                &&

                year !== yearFilter.value

            ){

                return false;

            }



            if(

                categoryFilter.value

                &&

                !categories.includes(

                    categoryFilter.value

                )

            ){

                return false;

            }



            if(

                ratingFilter.value

                &&

                rating < Number(

                    ratingFilter.value

                )

            ){

                return false;

            }



            if(

                featuredFilter.checked

                &&

                !featured

            ){

                return false;

            }



            if(durationFilter.value){

                switch(durationFilter.value){

                    case "short":

                        if(duration >= 90)

                            return false;

                        break;

                    case "medium":

                        if(

                            duration < 90

                            ||

                            duration > 120

                        )

                            return false;

                        break;

                    case "long":

                        if(duration <= 120)

                            return false;

                        break;

                }

            }

            return true;

        });

        sortCards();

    }
    function sortCards(){

        switch(sortSelect.value){

            case "title-asc":

                filteredCards.sort((a,b)=>

                    a.dataset.title.localeCompare(

                        b.dataset.title

                    )

                );

                break;

            case "title-desc":

                filteredCards.sort((a,b)=>

                    b.dataset.title.localeCompare(

                        a.dataset.title

                    )

                );

                break;

            case "year-desc":

                filteredCards.sort((a,b)=>

                    Number(b.dataset.year)-Number(a.dataset.year)

                );

                break;

            case "year-asc":

                filteredCards.sort((a,b)=>

                    Number(a.dataset.year)-Number(b.dataset.year)

                );

                break;

            case "rating-desc":

                filteredCards.sort((a,b)=>

                    Number(b.dataset.rating)-Number(a.dataset.rating)

                );

                break;

            case "rating-asc":

                filteredCards.sort((a,b)=>

                    Number(a.dataset.rating)-Number(b.dataset.rating)

                );

                break;

        }

        renderPage();

    }



    function renderPage(){

        cards.forEach(card=>{

            card.style.display="none";

        });

        const start=(currentPage-1)*ITEMS_PER_PAGE;

        const end=start+ITEMS_PER_PAGE;

        filteredCards

            .slice(start,end)

            .forEach(card=>{

                card.style.display="block";

            });

        showingLabel.textContent=

            filteredCards.length;

        totalLabel.textContent=

            cards.length;

        renderPagination();

    }



    function renderPagination(){

        pagination.innerHTML="";

        const totalPages=Math.ceil(

            filteredCards.length/

            ITEMS_PER_PAGE

        );

        if(totalPages<=1)

            return;

        for(

            let i=1;

            i<=totalPages;

            i++

        ){

            const li=document.createElement(

                "li"

            );

            li.className=

                "page-item"

                +(i===currentPage?

                " active":"");

            li.innerHTML=

                `<button class="page-link">${i}</button>`;

            li.addEventListener(

                "click",

                ()=>{

                    currentPage=i;

                    renderPage();

                    window.scrollTo({

                        top:0,

                        behavior:"smooth"

                    });

                }

            );

            pagination.appendChild(li);

        }

    }



    alphabetButtons.forEach(btn=>{

        btn.addEventListener(

            "click",

            ()=>{

                alphabetButtons.forEach(

                    b=>b.classList.remove(

                        "active"

                    )

                );

                btn.classList.add(

                    "active"

                );

                currentLetter=

                    btn.dataset.letter;

                currentPage=1;

                filterCards();

            }

        );

    });



    sortSelect.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            sortCards();

        }

    );



    yearFilter.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            filterCards();

        }

    );



    categoryFilter.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            filterCards();

        }

    );



    durationFilter.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            filterCards();

        }

    );



    ratingFilter.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            filterCards();

        }

    );



    featuredFilter.addEventListener(

        "change",

        ()=>{

            currentPage=1;

            filterCards();

        }

    );



    resetButton.addEventListener(

        "click",

        ()=>{

            currentLetter="ALL";

            currentPage=1;

            sortSelect.value="title-asc";

            yearFilter.value="";

            categoryFilter.value="";

            durationFilter.value="";

            ratingFilter.value="";

            featuredFilter.checked=false;

            alphabetButtons.forEach(

                b=>b.classList.remove(

                    "active"

                )

            );

            document.querySelector(

                '.alphabet-btn[data-letter="ALL"]'

            ).classList.add(

                "active"

            );

            filterCards();

        }

    );



    filterCards();

});

/*==================================================
=            BUSCADOR GLOBAL NAVBAR
==================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById(
        "navbar-search-form"
    );

    if (!form) return;

    const input = document.getElementById(
        "navbar-search"
    );

    const suggestions = document.getElementById(
        "navbar-search-results"
    );

    const isCatalog =
        window.location.pathname === "/catalogo";



    function getQuery(){

        const params = new URLSearchParams(

            window.location.search

        );

        return params.get("buscar") || "";

    }



    input.value = getQuery();



    form.addEventListener(

        "submit",

        function(e){

            e.preventDefault();

            const value = input.value.trim();

            if(value===""){

                input.focus();

                return;

            }

            if(isCatalog){

                const url = new URL(

                    window.location

                );

                url.searchParams.set(

                    "buscar",

                    value

                );

                window.location.href =

                    url.toString();

            }

            else{

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

        function(e){

            if(e.key==="Enter"){

                e.preventDefault();

                form.requestSubmit();

            }

        }

    );



    document.addEventListener(

        "click",

        function(e){

            if(

                !form.contains(

                    e.target

                )

            ){

                suggestions.classList.add(

                    "d-none"

                );

            }

        }

    );

    if(isCatalog){

        const searchValue = getQuery()

            .toLowerCase()

            .trim();

        if(searchValue!=="" &&

            typeof filterCards==="function"){

            cards.forEach(card=>{

                const title=

                    card.dataset.title||"";

                card.dataset.searchmatch=

                    title.includes(searchValue)

                    ?"1":"0";

            });

            const oldFilter=filterCards;

            filterCards=function(){

                filteredCards=cards.filter(card=>{

                    if(

                        searchValue!=="" &&

                        card.dataset.searchmatch!=="1"

                    ){

                        return false;

                    }

                    const letter=card.dataset.letter;

                    const year=card.dataset.year;

                    const rating=parseFloat(

                        card.dataset.rating||0

                    );

                    const duration=parseInt(

                        card.dataset.duration||0

                    );

                    const categories=

                        card.dataset.category||"";

                    const featured=

                        card.dataset.featured==="1";

                    if(

                        currentLetter!=="ALL" &&

                        currentLetter!=="#" &&

                        letter!==currentLetter

                    ){

                        return false;

                    }

                    if(

                        currentLetter==="#" &&

                        /^[A-Z]/.test(letter)

                    ){

                        return false;

                    }

                    if(

                        yearFilter.value &&

                        year!==yearFilter.value

                    ){

                        return false;

                    }

                    if(

                        categoryFilter.value &&

                        !categories.includes(

                            categoryFilter.value

                        )

                    ){

                        return false;

                    }

                    if(

                        ratingFilter.value &&

                        rating<Number(

                            ratingFilter.value

                        )

                    ){

                        return false;

                    }

                    if(

                        featuredFilter.checked &&

                        !featured

                    ){

                        return false;

                    }

                    if(durationFilter.value){

                        switch(durationFilter.value){

                            case "short":

                                if(duration>=90)

                                    return false;

                                break;

                            case "medium":

                                if(

                                    duration<90 ||

                                    duration>120

                                )

                                    return false;

                                break;

                            case "long":

                                if(duration<=120)

                                    return false;

                                break;

                        }

                    }

                    return true;

                });

                sortCards();

            };

            filterCards();

        }

    }



});