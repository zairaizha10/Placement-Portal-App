from extensions import db

class Application(db.Model):

    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)

    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id")
    )

    drive_id = db.Column(
        db.Integer,
        db.ForeignKey("placement_drives.id")
    )

    status = db.Column(
        db.String(20),
        default="Applied"
    )

    interview_date = db.Column(
        db.DateTime,
        nullable=True
    )

    interview_mode = db.Column(
        db.String(50),
        nullable=True
    )

    interview_link = db.Column(
        db.String(255),
        nullable=True
    )

    application_date = db.Column(
        db.DateTime,
        server_default=db.func.now()
    )

    __table_args__ = (
        db.UniqueConstraint(
            "student_id",
            "drive_id",
            name="unique_application"
        ),
    )