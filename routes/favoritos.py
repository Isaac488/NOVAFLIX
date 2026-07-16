from flask import Blueprint
from flask import session
from flask import redirect

from models import (
    db,
    Favorito
)

from utils.decorators import (
    login_required
)

favoritos_bp = Blueprint(
    "favoritos",
    __name__
)


@favoritos_bp.route(
    "/favorito/<int:pelicula_id>"
)
@login_required
def agregar_favorito(
    pelicula_id
):

    favorito = Favorito(

        usuario_id=session[
            "user_id"
        ],

        pelicula_id=pelicula_id
    )

    db.session.add(
        favorito
    )

    db.session.commit()

    return redirect("/")