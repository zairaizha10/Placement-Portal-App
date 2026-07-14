from extensions import db

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