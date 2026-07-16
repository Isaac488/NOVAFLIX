from flask import (
    Blueprint,
    render_template,
    abort
)

from models import (
    Pelicula,
    FuenteVideo
)

peliculas_bp = Blueprint(
    "peliculas",
    __name__
)


# ==========================================================
# INICIO
# ==========================================================

@peliculas_bp.route("/")
def index():

    destacadas = (

        Pelicula.query

        .filter_by(

            destacada=True,

            estado="publicada"

        )

        .order_by(
            Pelicula.fecha_creacion.desc()
        )

        .all()

    )

    recientes = (

        Pelicula.query

        .filter_by(
            estado="publicada"
        )

        .order_by(
            Pelicula.fecha_creacion.desc()
        )

        .all()

    )

    return render_template(

        "index.html",

        destacadas=destacadas,

        peliculas=recientes

    )


# ==========================================================
# CATÁLOGO
# ==========================================================

@peliculas_bp.route("/catalogo")
def catalogo():

    peliculas = (

        Pelicula.query

        .filter_by(
            estado="publicada"
        )

        .order_by(
            Pelicula.titulo.asc()
        )

        .all()

    )

    return render_template(

        "catalogo.html",

        peliculas=peliculas

    )


# ==========================================================
# DETALLE
# ==========================================================

@peliculas_bp.route("/pelicula/<int:id>")
def pelicula(id):

    pelicula = Pelicula.query.get_or_404(
        id
    )

    relacionadas = (

        Pelicula.query

        .filter(

            Pelicula.id != pelicula.id,

            Pelicula.estado == "publicada"

        )

        .limit(4)

        .all()

    )

    return render_template(

        "pelicula.html",

        pelicula=pelicula,

        relacionadas=relacionadas

    )


# ==========================================================
# REPRODUCTOR
# ==========================================================

@peliculas_bp.route("/watch/<int:id>")
def watch(id):

    pelicula = Pelicula.query.get_or_404(
        id
    )

    fuentes = (

        FuenteVideo.query

        .filter_by(

            pelicula_id=pelicula.id,

            activo=True

        )

        .order_by(
            FuenteVideo.orden.asc()
        )

        .all()

    )

    if not fuentes:

        abort(404)

    relacionadas = (

        Pelicula.query

        .filter(

            Pelicula.id != pelicula.id,

            Pelicula.estado == "publicada"

        )

        .limit(4)

        .all()

    )

    return render_template(

        "reproductor.html",

        pelicula=pelicula,

        fuentes=fuentes,

        fuente_actual=fuentes[0],

        relacionadas=relacionadas

    )