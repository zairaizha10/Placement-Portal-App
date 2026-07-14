from celery import Celery
from create_app import create_app
from config import Config
from celery.schedules import crontab

flask_app = create_app()

celery = Celery(
    "placement_portal",
    broker=Config.CELERY_BROKER_URL,
    backend=Config.CELERY_RESULT_BACKEND
)

celery.conf.update(
    timezone="Asia/Kolkata",
    enable_utc=False,

    beat_schedule={
        "daily-reminder": {
            "task": "tasks.send_deadline_reminders",
            "schedule": crontab(hour=9, minute=0),

        },
        "monthly-report": {
            "task": "tasks.send_monthly_admin_report",
            "schedule": crontab(day_of_month=1, hour=10, minute=0),
       }
    }
)

class ContextTask(celery.Task):
    def __call__(self, *args, **kwargs):
        with flask_app.app_context():
            return self.run(*args, **kwargs)

celery.Task = ContextTask

import tasks