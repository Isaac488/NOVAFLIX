from functools import wraps

from flask import (
    session,
    redirect,
    url_for,
    abort
)

from datetime import datetime

from models import (
    db,
    SesionUsuario
)


def _token_valido():

    user_id = session.get("user_id")
    token = session.get("token")

    if not user_id or not token:
        return False

    sesion = SesionUsuario.query.filter_by(
        usuario_id=user_id,
        token=token
    ).first()

    if not sesion:
        session.clear()
        return False

    if sesion.expira_en < datetime.now():

        db.session.delete(sesion)
        db.session.commit()

        session.clear()

        return False

    return True


def login_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if not _token_valido():

            return redirect(
                url_for(
                    "auth.session_expired"
                )
            )

        return f(*args, **kwargs)

    return decorated


def admin_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        if not _token_valido():

            return redirect(
                url_for(
                    "auth.session_expired"
                )
            )

        if session.get("rol") != "admin":

            abort(403)

        return f(*args, **kwargs)

    return decorated