from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# ==========================================================
# TABLA INTERMEDIA
# ==========================================================

pelicula_categoria = db.Table(

    "pelicula_categoria",

    db.Column(
        "pelicula_id",
        db.Integer,
        db.ForeignKey("peliculas.id"),
        primary_key=True
    ),

    db.Column(
        "categoria_id",
        db.Integer,
        db.ForeignKey("categorias.id"),
        primary_key=True
    )

)


# ==========================================================
# USUARIOS
# ==========================================================

class Usuario(db.Model):

    __tablename__ = "usuarios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    rol = db.Column(

        db.Enum(
            "admin",
            "usuario",
            name="rol_usuario"
        ),

        nullable=False,
        default="usuario"

    )

    fecha_registro = db.Column(

        db.DateTime,
        server_default=db.func.now()

    )

    favoritos = db.relationship(

        "Favorito",

        back_populates="usuario",

        cascade="all, delete-orphan"

    )

    historial = db.relationship(

        "Historial",

        back_populates="usuario",

        cascade="all, delete-orphan"

    )


# ==========================================================
# CATEGORIAS
# ==========================================================

class Categoria(db.Model):

    __tablename__ = "categorias"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre = db.Column(

        db.String(100),

        unique=True,

        nullable=False

    )

    peliculas = db.relationship(

        "Pelicula",

        secondary=pelicula_categoria,

        back_populates="categorias",

        lazy="subquery"

    )


# ==========================================================
# PELICULAS
# ==========================================================

class Pelicula(db.Model):

    __tablename__ = "peliculas"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    tmdb_id = db.Column(
        db.Integer,
        unique=True
    )

    titulo = db.Column(
        db.String(255),
        nullable=False
    )

    descripcion = db.Column(
        db.Text
    )

    poster = db.Column(
        db.String(500)
    )

    backdrop = db.Column(
        db.String(500)
    )

    anio = db.Column(
        db.Integer
    )

    calificacion = db.Column(
    db.Numeric(3, 1)
    )

    duracion = db.Column(
        db.Integer
    )

    destacada = db.Column(
        db.Boolean,
        default=False
    )

    estado = db.Column(

        db.Enum(

            "publicada",

            "oculta",

            name="estado_pelicula"

        ),

        default="publicada"

    )

    fecha_creacion = db.Column(

        db.DateTime,

        server_default=db.func.now()

    )

    fecha_actualizacion = db.Column(

        db.DateTime,

        server_default=db.func.now(),

        onupdate=db.func.now()

    )

    categorias = db.relationship(

        "Categoria",

        secondary=pelicula_categoria,

        back_populates="peliculas",

        lazy="subquery"

    )

    fuentes = db.relationship(

        "FuenteVideo",

        back_populates="pelicula",

        cascade="all, delete-orphan",

        order_by="FuenteVideo.orden"

    )

    favoritos = db.relationship(

        "Favorito",

        back_populates="pelicula",

        cascade="all, delete-orphan"

    )

    historial = db.relationship(

        "Historial",

        back_populates="pelicula",

        cascade="all, delete-orphan"

    )

# ==========================================================
# FUENTES DE VIDEO
# ==========================================================

class FuenteVideo(db.Model):

    __tablename__ = "fuentes_video"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    pelicula_id = db.Column(
        db.Integer,
        db.ForeignKey("peliculas.id", ondelete="CASCADE"),
        nullable=False
    )

    nombre_servidor = db.Column(
        db.String(150),
        default="Principal"
    )

    tipo = db.Column(

        db.Enum(

            "youtube",
            "directo",
            "embed",
            "hls",
            "mp4",

            name="tipo_fuente"

        ),

        nullable=False

    )

    url = db.Column(
        db.Text,
        nullable=False
    )

    calidad = db.Column(
        db.String(30)
    )

    idioma = db.Column(
        db.String(50)
    )

    orden = db.Column(
        db.Integer,
        default=1
    )

    activo = db.Column(
        db.Boolean,
        default=True
    )

    pelicula = db.relationship(

        "Pelicula",

        back_populates="fuentes"

    )

    subtitulos = db.relationship(

        "Subtitulo",

        back_populates="fuente",

        cascade="all, delete-orphan"

    )

    audios = db.relationship(

        "Audio",

        back_populates="fuente",

        cascade="all, delete-orphan"

    )


# ==========================================================
# SUBTÍTULOS
# ==========================================================

class Subtitulo(db.Model):

    __tablename__ = "subtitulos"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    fuente_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "fuentes_video.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    idioma = db.Column(
        db.String(50),
        nullable=False
    )

    url = db.Column(
        db.Text,
        nullable=False
    )

    predeterminado = db.Column(
        db.Boolean,
        default=False
    )

    fuente = db.relationship(

        "FuenteVideo",

        back_populates="subtitulos"

    )


# ==========================================================
# AUDIOS
# ==========================================================

class Audio(db.Model):

    __tablename__ = "audios"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    fuente_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "fuentes_video.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    idioma = db.Column(
        db.String(50),
        nullable=False
    )

    url = db.Column(
        db.Text
    )

    predeterminado = db.Column(
        db.Boolean,
        default=False
    )

    fuente = db.relationship(

        "FuenteVideo",

        back_populates="audios"

    )


# ==========================================================
# FAVORITOS
# ==========================================================

class Favorito(db.Model):

    __tablename__ = "favoritos"

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    pelicula_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "peliculas.id",
            ondelete="CASCADE"
        ),
        primary_key=True
    )

    fecha_agregado = db.Column(

        db.DateTime,

        server_default=db.func.now()

    )

    usuario = db.relationship(

        "Usuario",

        back_populates="favoritos"

    )

    pelicula = db.relationship(

        "Pelicula",

        back_populates="favoritos"

    )


# ==========================================================
# HISTORIAL
# ==========================================================

class Historial(db.Model):

    __tablename__ = "historial"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    usuario_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "usuarios.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    pelicula_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "peliculas.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    progreso = db.Column(
        db.Integer,
        default=0
    )

    fecha_visualizacion = db.Column(

        db.DateTime,

        server_default=db.func.now()

    )

    usuario = db.relationship(

        "Usuario",

        back_populates="historial"

    )

    pelicula = db.relationship(

        "Pelicula",

        back_populates="historial"

    )


# ==========================================================
# CONFIGURACIÓN
# ==========================================================

class Configuracion(db.Model):

    __tablename__ = "configuracion"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    nombre_sitio = db.Column(
        db.String(100),
        default="NOVAFLIX"
    )

    logo = db.Column(
        db.String(500)
    )

    descripcion = db.Column(
        db.Text
    )

    tiempo_token = db.Column(
        db.Integer,
        default=5
    )

    fecha_actualizacion = db.Column(

        db.DateTime,

        server_default=db.func.now(),

        onupdate=db.func.now()

    )

