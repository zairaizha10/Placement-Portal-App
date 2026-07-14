from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    active = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password = generate_password_hash(password)

class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    full_name = db.Column(db.String(100), nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    cgpa = db.Column(db.Float, nullable=False)
    graduation_year = db.Column(db.Integer)
    phone = db.Column(db.String(15))
    resume_path = db.Column(db.String(255))
    placement_status = db.Column(
        db.String(20),
        default="Not Placed"
    )
    is_active = db.Column(
        db.Boolean,
        default=True
    )

class Company(db.Model):
    __tablename__ = "companies"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )
    company_name = db.Column(
        db.String(150),
        nullable=False
    )
    hr_name = db.Column(db.String(100))
    hr_email = db.Column(db.String(100))
    website = db.Column(db.String(255))
    description = db.Column(db.Text)
    approval_status = db.Column(
        db.String(20),
        default="Pending"
    )
    is_blacklisted = db.Column(
        db.Boolean,
        default=False
    )

class PlacementDrive(db.Model):
    __tablename__ = "placement_drives"

    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(
        db.Integer,
        db.ForeignKey("companies.id")
    )
    job_title = db.Column(
        db.String(150),
        nullable=False
    )
    job_description = db.Column(db.Text)
    branch = db.Column(db.String(50))
    min_cgpa = db.Column(db.Float)
    graduation_year = db.Column(db.Integer)
    package = db.Column(db.Float)
    location = db.Column(db.String(100))
    deadline = db.Column(db.Date)
    status = db.Column(
        db.String(20),
        default="Pending"
    )

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
