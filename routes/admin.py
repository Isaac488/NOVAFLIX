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
    generate_password_hash
)

from models import (
    db,
    Usuario,
    Pelicula,
    Categoria,
    FuenteVideo,
    Configuracion,
    Favorito
)

from utils.decorators import (
    admin_required
)


admin_bp = Blueprint(
    "admin",
    __name__,
    url_prefix="/admin"
)


# ==========================================================
# DASHBOARD
# ==========================================================

@admin_bp.route("/")
@admin_required
def dashboard():

    total_peliculas = Pelicula.query.count()

    total_usuarios = Usuario.query.count()

    total_favoritos = Favorito.query.count()

    return render_template(

        "dashboard.html",

        total_peliculas=total_peliculas,

        total_usuarios=total_usuarios,

        total_favoritos=total_favoritos

    )


# ==========================================================
# PELÍCULAS
# ==========================================================

@admin_bp.route("/peliculas")
@admin_required
def peliculas_admin():

    peliculas = (

        Pelicula.query

        .order_by(
            Pelicula.id.desc()
        )

        .all()

    )

    return render_template(

        "admin_peliculas.html",

        peliculas=peliculas

    )


@admin_bp.route(
    "/peliculas/nueva",
    methods=["GET", "POST"]
)
@admin_required
def nueva_pelicula():

    categorias = Categoria.query.order_by(
        Categoria.nombre
    ).all()

    if request.method == "POST":

        pelicula = Pelicula(

            titulo=request.form["titulo"],

            descripcion=request.form.get(
                "descripcion"
            ),

            poster=request.form.get(
                "poster"
            ),

            backdrop=request.form.get(
                "backdrop"
            ),

            anio=request.form.get(
                "anio"
            ) or None,

            duracion=request.form.get(
                "duracion"
            ) or None,

            calificacion=request.form.get(
                "calificacion"
            ) or None,

            destacada=(
                "destacada"
                in request.form
            ),

            estado=request.form.get(
                "estado",
                "publicada"
            )

        )

        categorias_ids = request.form.getlist(
            "categorias"
        )

        if categorias_ids:

            pelicula.categorias = (

                Categoria.query.filter(

                    Categoria.id.in_(
                        categorias_ids
                    )

                ).all()

            )

        db.session.add(
            pelicula
        )

        db.session.flush()

        url_video = request.form.get(
            "video_url"
        )

        tipo_video = request.form.get(
            "tipo_video"
        )

        if url_video:

            fuente = FuenteVideo(

                pelicula_id=pelicula.id,

                nombre_servidor="Principal",

                tipo=tipo_video,

                url=url_video,

                calidad=request.form.get(
                    "calidad"
                ),

                idioma=request.form.get(
                    "idioma"
                ),

                orden=1,

                activo=True

            )

            db.session.add(
                fuente
            )

        db.session.commit()

        flash(
            "Película creada correctamente.",
            "success"
        )

        return redirect(
            url_for(
                "admin.peliculas_admin"
            )
        )

    return render_template(

        "admin_nueva_pelicula.html",

        categorias=categorias

    )


@admin_bp.route(
    "/peliculas/editar/<int:id>",
    methods=["GET", "POST"]
)
@admin_required
def editar_pelicula(id):

    pelicula = Pelicula.query.get_or_404(
        id
    )

    categorias = Categoria.query.order_by(
        Categoria.nombre
    ).all()

    fuente = None

    if pelicula.fuentes:

        fuente = pelicula.fuentes[0]

    if request.method == "POST":

        pelicula.titulo = request.form[
            "titulo"
        ]

        pelicula.descripcion = request.form.get(
            "descripcion"
        )

        pelicula.poster = request.form.get(
            "poster"
        )

        pelicula.backdrop = request.form.get(
            "backdrop"
        )

        pelicula.anio = request.form.get(
            "anio"
        ) or None

        pelicula.duracion = request.form.get(
            "duracion"
        ) or None

        pelicula.calificacion = request.form.get(
            "calificacion"
        ) or None

        pelicula.destacada = (
            "destacada"
            in request.form
        )

        pelicula.estado = request.form.get(
            "estado",
            "publicada"
        )

        pelicula.categorias.clear()

        categorias_ids = request.form.getlist(
            "categorias"
        )

        if categorias_ids:

            pelicula.categorias = (

                Categoria.query.filter(

                    Categoria.id.in_(
                        categorias_ids
                    )

                ).all()

            )

        url_video = request.form.get(
            "video_url"
        )

        tipo_video = request.form.get(
            "tipo_video"
        )

        if fuente:

            fuente.url = url_video

            fuente.tipo = tipo_video

            fuente.calidad = request.form.get(
                "calidad"
            )

            fuente.idioma = request.form.get(
                "idioma"
            )

        elif url_video:

            db.session.add(

                FuenteVideo(

                    pelicula_id=pelicula.id,

                    nombre_servidor="Principal",

                    tipo=tipo_video,

                    url=url_video,

                    calidad=request.form.get(
                        "calidad"
                    ),

                    idioma=request.form.get(
                        "idioma"
                    ),

                    orden=1,

                    activo=True

                )

            )

        db.session.commit()

        flash(
            "Película actualizada correctamente.",
            "success"
        )

        return redirect(
            url_for(
                "admin.peliculas_admin"
            )
        )

    return render_template(

        "admin_editar_pelicula.html",

        pelicula=pelicula,

        categorias=categorias,

        fuente=fuente

    )

@admin_bp.route("/peliculas/eliminar/<int:id>")
@admin_required
def eliminar_pelicula(id):

    pelicula = Pelicula.query.get_or_404(id)

    db.session.delete(
        pelicula
    )

    db.session.commit()

    flash(
        "Película eliminada correctamente.",
        "success"
    )

    return redirect(
        url_for(
            "admin.peliculas_admin"
        )
    )


# ==========================================================
# USUARIOS
# ==========================================================

@admin_bp.route("/usuarios")
@admin_required
def usuarios_admin():

    usuarios = (
        Usuario.query
        .order_by(
            Usuario.id.desc()
        )
        .all()
    )

    return render_template(

        "admin_usuarios.html",

        usuarios=usuarios

    )


@admin_bp.route(
    "/usuarios/nuevo",
    methods=["GET", "POST"]
)
@admin_required
def nuevo_usuario():

    if request.method == "POST":

        usuario = Usuario(

            nombre=request.form["nombre"],

            email=request.form["email"],

            password_hash=generate_password_hash(
                request.form["password"]
            ),

            rol=request.form["rol"]

        )

        db.session.add(
            usuario
        )

        db.session.commit()

        flash(
            "Usuario creado correctamente.",
            "success"
        )

        return redirect(
            url_for(
                "admin.usuarios_admin"
            )
        )

    return render_template(
        "admin_nuevo_usuario.html"
    )


@admin_bp.route(
    "/usuarios/editar/<int:id>",
    methods=["GET", "POST"]
)
@admin_required
def editar_usuario(id):

    usuario = Usuario.query.get_or_404(
        id
    )

    if request.method == "POST":

        usuario.nombre = request.form[
            "nombre"
        ]

        usuario.email = request.form[
            "email"
        ]

        usuario.rol = request.form[
            "rol"
        ]

        password = request.form.get(
            "password"
        )

        if password:

            usuario.password_hash = (
                generate_password_hash(
                    password
                )
            )

        db.session.commit()

        flash(
            "Usuario actualizado correctamente.",
            "success"
        )

        return redirect(
            url_for(
                "admin.usuarios_admin"
            )
        )

    return render_template(

        "admin_editar_usuario.html",

        usuario=usuario

    )


@admin_bp.route(
    "/usuarios/eliminar/<int:id>"
)
@admin_required
def eliminar_usuario(id):

    usuario = Usuario.query.get_or_404(
        id
    )

    if usuario.id == session.get(
        "user_id"
    ):

        flash(
            "No puedes eliminar tu propia cuenta.",
            "warning"
        )

        return redirect(
            url_for(
                "admin.usuarios_admin"
            )
        )

    db.session.delete(
        usuario
    )

    db.session.commit()

    flash(
        "Usuario eliminado correctamente.",
        "success"
    )

    return redirect(
        url_for(
            "admin.usuarios_admin"
        )
    )


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

@admin_bp.route(
    "/configuracion",
    methods=["GET", "POST"]
)
@admin_required
def configuracion():

    config = Configuracion.query.get(1)

    if not config:

        config = Configuracion(

            nombre_sitio="NOVAFLIX",

            descripcion="Plataforma de Streaming",

            tiempo_token=5

        )

        db.session.add(
            config
        )

        db.session.commit()

    if request.method == "POST":

        config.nombre_sitio = request.form.get(
            "nombre_sitio"
        )

        config.logo = request.form.get(
            "logo"
        )

        config.descripcion = request.form.get(
            "descripcion"
        )

        config.tiempo_token = request.form.get(
            "tiempo_token"
        ) or 5

        db.session.commit()

        flash(
            "Configuración actualizada correctamente.",
            "success"
        )

        return redirect(
            url_for(
                "admin.configuracion"
            )
        )

    return render_template(

        "admin_configuracion.html",

        config=config

    )


# ==========================================================
# API CONFIGURACIÓN
# ==========================================================

@admin_bp.route(
    "/api/configuracion/token"
)
def obtener_tiempo_token():

    config = Configuracion.query.get(1)

    tiempo = 5

    if config:

        tiempo = config.tiempo_token

    return jsonify({

        "tiempo_token": tiempo

    })


# ==========================================================
# API SESIÓN
# ==========================================================

@admin_bp.route(
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