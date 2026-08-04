from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    session,
    jsonify
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from models import (
    db,
    Usuario,
    Configuracion,
    SesionUsuario
)

from datetime import (
    datetime, 
    timedelta, 
)

import secrets

auth_bp = Blueprint(
    "auth",
    __name__
)

# ==========================================================
# UTILIDADES DE SESIÓN
# ==========================================================

def _obtener_sesion_actual():

    user_id = session.get("user_id")
    token = session.get("token")

    if not user_id or not token:
        return None

    sesion = SesionUsuario.query.filter_by(
        usuario_id=user_id,
        token=token
    ).first()

    if not sesion:
        return None

    if sesion.expira_en < datetime.now():

        db.session.delete(sesion)
        db.session.commit()

        session.clear()

        return None

    return sesion


def _eliminar_sesion_actual():

    token = session.get("token")

    if token:

        sesion = SesionUsuario.query.filter_by(
            token=token
        ).first()

        if sesion:

            db.session.delete(sesion)
            db.session.commit()

    session.clear()

def obtener_tiempo_token():

    try:

        config = Configuracion.query.first()

        if (
            config
            and
            config.tiempo_token
            and
            config.tiempo_token > 0
        ):
            return config.tiempo_token

    except Exception:

        db.session.rollback()

    return 5

# ==========================================================
# LOGIN
# ==========================================================

@auth_bp.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    if request.method == "POST":

        email = request.form["email"]

        password = request.form["password"]

        usuario = Usuario.query.filter_by(
            email=email
        ).first()


        if (
            usuario
            and
            check_password_hash(
                usuario.password_hash,
                password
            )
        ):

            # Limpiar sesión anterior
            session.clear()


            # Crear sesión Flask
            session["user_id"] = usuario.id

            session["nombre"] = usuario.nombre

            session["rol"] = usuario.rol


            # Crear token único
            token = secrets.token_urlsafe(32)


            # Guardar token en sesión
            session["token"] = token


            # Crear registro de sesión en BD
            ahora = datetime.now()

            nueva_sesion = SesionUsuario(
                usuario_id=usuario.id,
                token=token,
                creado_en=ahora,
                ultima_actividad=ahora,
                expira_en=ahora + timedelta(minutes=obtener_tiempo_token())
            )


            db.session.add(
                nueva_sesion
            )

            db.session.commit()


            flash(
                f"Bienvenido, {usuario.nombre}",
                "success"
            )


            if usuario.rol == "admin":

                return redirect(
                    url_for(
                        "admin.dashboard"
                    )
                )


            return redirect(
                url_for(
                    "peliculas.index"
                )
            )


        flash(
            "Correo o contraseña incorrectos.",
            "danger"
        )


    return render_template(
        "login.html"
    )



# ==========================================================
# REGISTRO
# ==========================================================

@auth_bp.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    if request.method == "POST":

        nombre = request.form["nombre"]

        email = request.form["email"]

        password = request.form["password"]

        existe = Usuario.query.filter_by(
            email=email
        ).first()

        if existe:

            flash(

                "Ya existe una cuenta asociada a ese correo electrónico.",

                "warning"

            )

            return redirect(
                url_for(
                    "auth.register"
                )
            )

        nuevo = Usuario(

            nombre=nombre,

            email=email,

            password_hash=generate_password_hash(
                password
            ),

            rol="usuario"

        )

        db.session.add(
            nuevo
        )

        db.session.commit()

        flash(

            "Cuenta creada correctamente. Ya puedes iniciar sesión.",

            "success"

        )

        return redirect(
            url_for(
                "auth.login"
            )
        )

    return render_template(
        "register.html"
    )


# ==========================================================
# LOGOUT
# ==========================================================

@auth_bp.route("/logout")
def logout():

    _eliminar_sesion_actual()

    flash(

        "Sesión cerrada correctamente.",

        "info"

    )

    return redirect(
        url_for(
            "peliculas.index"
        )
    )


# ==========================================================
# SESIÓN EXPIRADA
# ==========================================================

@auth_bp.route(
    "/session-expired"
)
def session_expired():

    _eliminar_sesion_actual()

    return render_template(
        "session_expired.html"
    )


# ==========================================================
# API ESTADO DE SESIÓN
# ==========================================================

@auth_bp.route(
    "/api/session-status"
)
def session_status():

    sesion = _obtener_sesion_actual()

    if not sesion:

        return jsonify({

            "autenticado": False,

            "rol": None,

            "usuario": None

        })

    return jsonify({

        "autenticado": True,

        "rol": session.get("rol"),

        "usuario": session.get("nombre")

    })


# ==========================================================
# REFRESH DE SESIÓN
# ==========================================================

@auth_bp.route(
    "/api/refresh-token",
    methods=["POST"]
)
def refresh_token():

    sesion = _obtener_sesion_actual()

    if not sesion:

        return jsonify({

            "success": False,

            "mensaje": "Sesión expirada."

        }), 401

    ahora = datetime.now()

    sesion.ultima_actividad = ahora

    sesion.expira_en = ahora + timedelta(minutes=obtener_tiempo_token())

    db.session.commit()

    return jsonify({

        "success": True,

        "mensaje": "Sesión renovada."

    }) 