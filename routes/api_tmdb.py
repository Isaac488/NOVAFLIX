from flask import Blueprint
from flask import request
from flask import jsonify

from utils.tmdb import (
    buscar_pelicula,
    obtener_pelicula
)

from utils.decorators import (
    admin_required
)

api_tmdb_bp = Blueprint(
    "api_tmdb",
    __name__,
    url_prefix="/api/tmdb"
)


@api_tmdb_bp.route("/buscar")
@admin_required
def buscar():

    nombre = request.args.get(
        "q"
    )

    return jsonify(
        buscar_pelicula(nombre)
    )


@api_tmdb_bp.route("/detalle/<int:id>")
@admin_required
def detalle(id):

    return jsonify(
        obtener_pelicula(id)
    )