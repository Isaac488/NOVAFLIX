/*
=========================================
NOVAFLIX PLAYER
Versión 2.0
Preparado para futura reestructuración
=========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    iniciarPlayer
);

async function iniciarPlayer() {

    const contenedor =
        document.getElementById(
            "novaflix-player"
        );

    if (!contenedor) {

        return;

    }

    const peliculaId =
        contenedor.dataset.pelicula;

    if (!peliculaId) {

        mostrarError(
            "Película no encontrada."
        );

        return;

    }

    try {

        mostrarCarga();

        const response =
            await fetch(
                `/api/player/${peliculaId}`
            );

        if (!response.ok) {

            throw new Error();

        }

        const data =
            await response.json();

        construirPlayer(data);

    }

    catch(error) {

        console.error(error);

        mostrarError(
            "No fue posible cargar el reproductor."
        );

    }

}

function construirPlayer(data) {

    const contenedor =
        document.getElementById(
            "novaflix-player"
        );

    contenedor.innerHTML = "";

    switch(data.tipo){

        case "video":

            crearVideoHTML5(
                data,
                contenedor
            );

            break;

        case "youtube":

            crearYoutube(
                data,
                contenedor
            );

            break;

        case "hls":

            crearHLS(
                data,
                contenedor
            );

            break;

        default:

            mostrarError(
                "Formato no soportado."
            );

    }

}

/*
=========================================
VIDEO HTML5
=========================================
*/

function crearVideoHTML5(
    data,
    contenedor
){

    const video =
        document.createElement(
            "video"
        );

    video.className =
        "novaflix-video";

    video.controls = true;

    video.autoplay = false;

    video.preload = "metadata";

    video.playsInline = true;

    video.src = data.url;

    contenedor.appendChild(video);

}

/*
=========================================
YOUTUBE
=========================================
*/

function crearYoutube(
    data,
    contenedor
){

    /*
        Temporalmente seguimos usando
        iframe únicamente para YouTube.

        Cuando exista un backend con
        yt-dlp o proxy interno,
        solamente cambiaremos
        esta función.
    */

    const iframe =
        document.createElement(
            "iframe"
        );

    iframe.className =
        "novaflix-video";

    iframe.src =
        data.url;

    iframe.allowFullscreen = true;

    iframe.frameBorder = 0;

    contenedor.appendChild(
        iframe
    );

}

/*
=========================================
HLS (.m3u8)
=========================================
*/

function crearHLS(
    data,
    contenedor
){

    const video =
        document.createElement(
            "video"
        );

    video.controls = true;

    video.className =
        "novaflix-video";

    video.src =
        data.url;

    contenedor.appendChild(
        video
    );

}

/*
=========================================
LOADING
=========================================
*/

function mostrarCarga(){

    document.getElementById(
        "novaflix-player"
    ).innerHTML = `

        <div class="text-center py-5">

            <div
                class="spinner-border text-danger"
            ></div>

            <p class="mt-3">

                Preparando reproducción...

            </p>

        </div>

    `;

}

/*
=========================================
ERROR
=========================================
*/

function mostrarError(texto){

    document.getElementById(
        "novaflix-player"
    ).innerHTML = `

        <div
            class="alert alert-danger"
        >

            <i
                class="bi bi-exclamation-triangle-fill"
            ></i>

            ${texto}

        </div>

    `;

}