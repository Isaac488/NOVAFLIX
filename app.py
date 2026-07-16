from flask import Flask

from config import Config
from models import db

from routes.auth import auth_bp
from routes.peliculas import peliculas_bp
from routes.admin import admin_bp
from routes.api_tmdb import api_tmdb_bp

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(peliculas_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(api_tmdb_bp)

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)