from extensions import db

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