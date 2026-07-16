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
    Usuario
)

auth_bp = Blueprint(
    "auth",
    __name__
)


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

            session.clear()

            session["user_id"] = usuario.id

            session["nombre"] = usuario.nombre

            session["rol"] = usuario.rol

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

    session.clear()

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

    session.clear()

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

    return jsonify({

        "autenticado":
            bool(
                session.get(
                    "user_id"
                )
            ),

        "rol":
            session.get(
                "rol"
            ),

        "usuario":
            session.get(
                "nombre"
            )

    })


# ==========================================================
# REFRESH DE SESIÓN
# ==========================================================

@auth_bp.route(
    "/api/refresh-token",
    methods=["POST"]
)
def refresh_token():

    if "user_id" not in session:

        return jsonify({

            "success": False

        }), 401

    session.modified = True

    return jsonify({

        "success": True,

        "mensaje":
            "Sesión actualizada."

    })  