import os
from flask import Flask, render_template, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from extensions import db, jwt, cache, mail

from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.company import company_bp
from routes.student import student_bp

from models import User, Student, Company, PlacementDrive, Application


def create_app():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    app = Flask(
        __name__,
        template_folder=os.path.join(base_dir, "templates"),
        static_folder=os.path.join(base_dir, "static")
    )
    CORS(app)

    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print("INVALID TOKEN:", error)
        return {"message": error}, 422

    @jwt.unauthorized_loader
    def missing_token(error):
        print("MISSING TOKEN:", error)
        return {"message": error}, 422

    cache.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(company_bp, url_prefix="/api")
    app.register_blueprint(student_bp, url_prefix="/api")

    with app.app_context():

        db.create_all()

        admin = User.query.filter_by(
            email="admin@placement.com"
        ).first()

        if not admin:

            admin = User(
                email="admin@placement.com",
                role="admin"
            )

            admin.set_password("admin123")

            db.session.add(admin)
            db.session.commit()

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def home(path):
        if path.startswith("api/") or path.startswith("static/"):
            return jsonify({"message": "Not Found"}), 404
        return render_template("index.html")

    @app.route("/api/test")
    def test():
        return {
            "message": "Backend Working"
        }

    return app