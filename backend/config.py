import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

import os



class Config:
    SECRET_KEY = "placement-portal-secret-key"

    SQLALCHEMY_DATABASE_URI = "sqlite:///placement.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = "jwt-secret-key"


    UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "resume")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024   
    
    CACHE_TYPE = "RedisCache"
    CACHE_REDIS_HOST = "localhost"
    CACHE_REDIS_PORT = 6379
    CACHE_REDIS_DB = 0
    CACHE_DEFAULT_TIMEOUT = 60

    CELERY_BROKER_URL = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND = "redis://localhost:6379/0"
    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = "YOUR MAIL USERNAME"
    MAIL_PASSWORD = "YOUR MAIL PASSWORD"
    MAIL_DEFAULT_SENDER = "YOUR MAIL USERNAME"