DROP DATABASE IF EXISTS novaflix;

CREATE DATABASE novaflix
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE novaflix;

CREATE TABLE configuracion (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre_sitio VARCHAR(100)
        DEFAULT 'NOVAFLIX',

    logo VARCHAR(500),

    descripcion TEXT,

    tiempo_token INT
        DEFAULT 3600,

    fecha_actualizacion TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

INSERT INTO configuracion (

    nombre_sitio,
    logo,
    descripcion,
    tiempo_token

)

VALUES (

    'NOVAFLIX',
    NULL,
    'Plataforma de Streaming desarrollada con Flask',
    3600

);

CREATE TABLE usuarios (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100)
        NOT NULL,

    email VARCHAR(150)
        NOT NULL UNIQUE,

    password_hash VARCHAR(255)
        NOT NULL,

    rol ENUM(

        'admin',
        'usuario'

    ) DEFAULT 'usuario',

    foto_perfil VARCHAR(500),

    fecha_registro TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE categorias (

    id INT AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(100)
        UNIQUE NOT NULL

);

CREATE TABLE peliculas (

    id INT AUTO_INCREMENT PRIMARY KEY,

    tmdb_id INT UNIQUE,

    titulo VARCHAR(255)
        NOT NULL,

    descripcion TEXT,

    poster VARCHAR(500),

    backdrop VARCHAR(500),

    anio INT,

    duracion INT,

    calificacion DECIMAL(3,1),

    destacada BOOLEAN
        DEFAULT FALSE,

    estado ENUM(

        'publicada',
        'oculta'

    ) DEFAULT 'publicada',

    fecha_creacion TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    fecha_actualizacion TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

-- --------------------------------------------------------
-- TABLA DE FUENTES DE REPRODUCCIÓN
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `fuentes_video` (

    `id` INT NOT NULL AUTO_INCREMENT,

    `pelicula_id` INT NOT NULL,

    `nombre_servidor` VARCHAR(100) NOT NULL,

    `tipo` ENUM(
        'mp4',
        'mkv',
        'webm',
        'youtube',
        'hls',
        'dash',
        'embed'
    ) NOT NULL,

    `url` TEXT NOT NULL,

    `idioma` VARCHAR(50) DEFAULT 'Español',

    `calidad` VARCHAR(20) DEFAULT '1080p',

    `activo` TINYINT(1) DEFAULT 1,

    `orden` INT DEFAULT 1,

    PRIMARY KEY (`id`),

    KEY `pelicula_id` (`pelicula_id`),

    CONSTRAINT `fk_fuente_pelicula`
        FOREIGN KEY (`pelicula_id`)
        REFERENCES `peliculas` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------
-- TABLA DE SUBTÍTULOS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `subtitulos` (

    `id` INT NOT NULL AUTO_INCREMENT,

    `pelicula_id` INT NOT NULL,

    `idioma` VARCHAR(50) NOT NULL,

    `archivo` VARCHAR(500) NOT NULL,

    `tipo` ENUM(
        'vtt',
        'srt'
    ) DEFAULT 'vtt',

    `activo` TINYINT(1) DEFAULT 1,

    PRIMARY KEY (`id`),

    KEY `pelicula_id` (`pelicula_id`),

    CONSTRAINT `fk_subtitulo_pelicula`
        FOREIGN KEY (`pelicula_id`)
        REFERENCES `peliculas` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------
-- TABLA DE AUDIOS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `audios` (

    `id` INT NOT NULL AUTO_INCREMENT,

    `pelicula_id` INT NOT NULL,

    `idioma` VARCHAR(50) NOT NULL,

    `url` TEXT NOT NULL,

    `activo` TINYINT(1) DEFAULT 1,

    PRIMARY KEY (`id`),

    KEY `pelicula_id` (`pelicula_id`),

    CONSTRAINT `fk_audio_pelicula`
        FOREIGN KEY (`pelicula_id`)
        REFERENCES `peliculas` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------
-- TABLA DE HISTORIAL
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `historial` (

    `id` INT NOT NULL AUTO_INCREMENT,

    `usuario_id` INT NOT NULL,

    `pelicula_id` INT NOT NULL,

    `fuente_id` INT DEFAULT NULL,

    `progreso` INT DEFAULT 0,

    `fecha_visualizacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),

    KEY `usuario_id` (`usuario_id`),

    KEY `pelicula_id` (`pelicula_id`),

    KEY `fuente_id` (`fuente_id`),

    CONSTRAINT `fk_historial_usuario`
        FOREIGN KEY (`usuario_id`)
        REFERENCES `usuarios` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_historial_pelicula`
        FOREIGN KEY (`pelicula_id`)
        REFERENCES `peliculas` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_historial_fuente`
        FOREIGN KEY (`fuente_id`)
        REFERENCES `fuentes_video` (`id`)
        ON DELETE SET NULL

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- TABLA PELICULA_CATEGORIA
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS pelicula_categoria (

    pelicula_id INT NOT NULL,

    categoria_id INT NOT NULL,

    PRIMARY KEY (

        pelicula_id,

        categoria_id

    ),

    CONSTRAINT fk_pc_pelicula

        FOREIGN KEY (pelicula_id)

        REFERENCES peliculas(id)

        ON DELETE CASCADE

        ON UPDATE CASCADE,

    CONSTRAINT fk_pc_categoria

        FOREIGN KEY (categoria_id)

        REFERENCES categorias(id)

        ON DELETE CASCADE

        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------
-- TABLA FAVORITOS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS favoritos (

    usuario_id INT NOT NULL,

    pelicula_id INT NOT NULL,

    fecha_agregado TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (

        usuario_id,

        pelicula_id

    ),

    CONSTRAINT fk_favorito_usuario

        FOREIGN KEY (usuario_id)

        REFERENCES usuarios(id)

        ON DELETE CASCADE

        ON UPDATE CASCADE,

    CONSTRAINT fk_favorito_pelicula

        FOREIGN KEY (pelicula_id)

        REFERENCES peliculas(id)

        ON DELETE CASCADE

        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;



-- --------------------------------------------------------
-- ÍNDICES
-- --------------------------------------------------------

CREATE INDEX idx_pelicula_titulo
ON peliculas(titulo);

CREATE INDEX idx_pelicula_anio
ON peliculas(anio);

CREATE INDEX idx_pelicula_estado
ON peliculas(estado);

CREATE INDEX idx_pelicula_tmdb
ON peliculas(tmdb_id);

CREATE INDEX idx_fuente_pelicula
ON fuentes_video(pelicula_id);

CREATE INDEX idx_fuente_tipo
ON fuentes_video(tipo);

CREATE INDEX idx_historial_usuario
ON historial(usuario_id);

CREATE INDEX idx_historial_pelicula
ON historial(pelicula_id);

CREATE INDEX idx_usuario_email
ON usuarios(email);

CREATE INDEX idx_categoria_nombre
ON categorias(nombre);

-- --------------------------------------------------------
-- CONFIGURACIÓN INICIAL
-- --------------------------------------------------------




-- --------------------------------------------------------
-- CATEGORÍAS
-- --------------------------------------------------------

INSERT INTO categorias (nombre)

VALUES

('Acción'),
('Aventura'),
('Animación'),
('Ciencia Ficción'),
('Comedia'),
('Crimen'),
('Documental'),
('Drama'),
('Fantasía'),
('Romance'),
('Suspenso'),
('Terror');



-- --------------------------------------------------------
-- USUARIO ADMINISTRADOR
-- --------------------------------------------------------

INSERT INTO usuarios (

    nombre,

    email,

    password_hash,

    rol

)

VALUES (

    'Admin_Test',

    'test@novaflix.com',

    'CAMBIAR_POR_HASH_REAL',

    'admin'

);



-- --------------------------------------------------------
-- USUARIO NORMAL
-- --------------------------------------------------------

INSERT INTO usuarios (

    nombre,

    email,

    password_hash,

    rol

)

VALUES (

    'User_Test',

    'user@novaflix.com',

    'CAMBIAR_POR_HASH_REAL',

    'usuario'

);



-- --------------------------------------------------------
-- PELÍCULA DEMO
-- --------------------------------------------------------

INSERT INTO peliculas (

    tmdb_id,

    titulo,

    descripcion,

    poster,

    backdrop,

    anio,

    duracion,

    calificacion,

    destacada,

    estado

)

VALUES (

    NULL,

    'The Batman',

    'Película de demostración.',

    'https://image.tmdb.org/t/p/w500/mo7teil1qH0SxgLijnqeYP1Eb4w.jpg',

    'https://image.tmdb.org/t/p/original/IYUD7rAIXzBM91TT3Z5fILUS7n.jpg',

    2022,

    176,

    7.4,

    TRUE,

    'publicada'

);



-- --------------------------------------------------------
-- CATEGORÍA DEMO
-- --------------------------------------------------------

INSERT INTO pelicula_categoria (

    pelicula_id,

    categoria_id

)

VALUES (

    1,

    1

);



-- --------------------------------------------------------
-- FUENTE MP4
-- --------------------------------------------------------

INSERT INTO fuentes_video (

    pelicula_id,

    nombre_servidor,

    tipo,

    url,

    idioma,

    calidad,

    orden

)

VALUES (

    1,

    'Servidor Principal',

    'mp4',

    '',

    'Español Latino',

    '1080p',

    1

);



-- --------------------------------------------------------
-- FUENTE YOUTUBE
-- --------------------------------------------------------

INSERT INTO fuentes_video (

    pelicula_id,

    nombre_servidor,

    tipo,

    url,

    idioma,

    calidad,

    orden

)

VALUES (

    1,

    'Trailer Oficial',

    'youtube',

    '',

    'Español',

    '1080p',

    2

);



-- --------------------------------------------------------
-- SUBTÍTULO DEMO
-- --------------------------------------------------------

INSERT INTO subtitulos (

    pelicula_id,

    idioma,

    archivo,

    tipo

)

VALUES (

    1,

    'Español',

    '',

    'vtt'

);



-- --------------------------------------------------------
-- AUDIO DEMO
-- --------------------------------------------------------

INSERT INTO audios (

    pelicula_id,

    idioma,

    url

)

VALUES (

    1,

    'Español Latino',

    ''

);