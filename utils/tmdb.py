import requests

from flask import current_app


BASE_URL = "https://api.themoviedb.org/3"


def buscar_pelicula(nombre):

    api_key = current_app.config[
        "TMDB_API_KEY"
    ]

    response = requests.get(

        f"{BASE_URL}/search/movie",

        params={
            "api_key": api_key,
            "query": nombre,
            "language": "es-ES"
        }

    )

    return response.json()


def obtener_pelicula(tmdb_id):

    api_key = current_app.config[
        "TMDB_API_KEY"
    ]

    response = requests.get(

        f"{BASE_URL}/movie/{tmdb_id}",

        params={
            "api_key": api_key,
            "language": "es-ES"
        }

    )

    return response.json()