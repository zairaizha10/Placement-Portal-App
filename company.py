from extensions import db

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