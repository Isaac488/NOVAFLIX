# Novaflix

**Novaflix** es una plataforma web de gestión y reproducción de contenido multimedia inspirada en servicios de streaming modernos. El proyecto permite administrar un catálogo de películas, consultar información mediante la API de TMDB, gestionar usuarios y controlar el acceso mediante autenticación con tokens temporales.

Desarrollado como proyecto académico utilizando **Python, Flask, MySQL y Bootstrap 5**, con una arquitectura modular preparada para futuras ampliaciones.

---

## Características principales

### Usuarios
- Registro e inicio de sesión.
- Gestión de perfiles.
- Sistema de autenticación mediante tokens.
- Expiración automática de sesión después de un periodo de inactividad.
- Separación entre usuarios normales y administradores.

### Catálogo multimedia
- Visualización de películas disponibles.
- Fichas individuales con:
  - Título.
  - Poster.
  - Imagen de fondo.
  - Sinopsis.
  - Información adicional.
- Integración con la API de **TMDB** para obtener metadatos cinematográficos.
- Soporte para contenido multimedia local.

### Panel administrativo
- Dashboard con estadísticas generales.
- Gestión de películas.
- Importación de información desde TMDB.
- Preparado para futuras funciones:
  - Gestión avanzada de usuarios.
  - Categorías.
  - Estadísticas de reproducción.
  - Administración de contenido multimedia.

---

# Tecnologías utilizadas

## Backend
- Python 3
- Flask
- Flask-MySQLdb
- Werkzeug Security

## Frontend
- HTML5
- CSS3
- Bootstrap 5.3
- Bootstrap Icons
- JavaScript

## Base de datos
- MySQL

## APIs externas
- TMDB API

---

# Estructura del proyecto

```
NOVAFLIX/
│
├── app.py                  # Archivo principal de Flask
├── config.py               # Configuración del proyecto
├── requirements.txt        # Dependencias
│
├── routes/
│   ├── auth.py             # Login, registro y autenticación
│   ├── peliculas.py        # Gestión del catálogo
│   └── api_tmdb.py         # Integración con TMDB
│
├── utils/
│   └── tmdb.py             # Funciones auxiliares de TMDB
│
├── templates/
│   ├── layout.html
│   ├── index.html
│   ├── catalogo.html
│   ├── perfil.html
│   │
│   ├── admin/
│   │   ├── dashboard.html
│   │   └── peliculas.html
│
├── static/
│   ├── css/
│   ├── js/
│   └── img/
│
└── database/
    └── novaflix.sql
```

---

# Instalación

## 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/novaflix.git
```

Entrar al proyecto:

```bash
cd NOVAFLIX
```

---

## 2. Crear entorno virtual

```bash
python -m venv venv
```

Activar entorno virtual:

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

---

## 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

# Configuración de base de datos

Crear una base de datos MySQL:

```sql
CREATE DATABASE novaflix;
```

Importar el archivo:

```
database/novaflix.sql
```

Configurar las credenciales en:

```
config.py
```

Ejemplo:

```python
MYSQL_HOST = "localhost"
MYSQL_USER = "usuario"
MYSQL_PASSWORD = "password"
MYSQL_DB = "novaflix"
```

---

# Configuración TMDB

Crear una cuenta en TMDB y obtener una API Key.

Agregarla en:

```
config.py
```

Ejemplo:

```python
TMDB_API_KEY = "tu_api_key"
```

---

# Ejecutar el proyecto

Iniciar Flask:

```bash
python app.py
```

El servidor estará disponible en:

```
http://localhost:5000
```

---

# Usuarios del sistema

## Administrador

Permite:
- Acceso al dashboard.
- Gestión del catálogo.
- Administración del contenido.

## Usuario

Permite:
- Explorar películas.
- Consultar información.
- Gestionar su sesión.

---

# Sistema de tokens

Novaflix implementa un sistema de sesión basado en tokens:

- Cada inicio de sesión genera un token único.
- El token almacena la última actividad del usuario.
- Si supera el tiempo límite configurado, la sesión se invalida automáticamente.
- Los administradores cuentan con acceso permanente.

---

# Despliegue

El proyecto está preparado para desplegarse utilizando servicios como:

- Render.
- Bases de datos MySQL compatibles en la nube.

Para producción se recomienda configurar:

- Variables de entorno.
- Servidor WSGI.
- Base de datos externa.

---

# Licencia

Proyecto desarrollado con fines educativos.
