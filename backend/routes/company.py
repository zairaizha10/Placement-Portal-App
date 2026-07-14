from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity


from extensions import db
from models import Company, PlacementDrive, User, Application, Student
from datetime import datetime

company_bp = Blueprint("company", __name__)


@company_bp.route("/company/create-drive", methods=["POST"])
@jwt_required()
def create_drive():

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(
        user_id=user_id
    ).first()

    if company.is_blacklisted:
        return jsonify({
            "message": "Your company has been blacklisted by the admin."
        }), 403

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    if company.approval_status != "Approved":
        return jsonify({
            "message": "Company Not Approved By Admin"
        }), 403

    data = request.get_json()

    drive = PlacementDrive(
        company_id=company.id,
        job_title=data["job_title"],
        job_description=data["job_description"],
        branch=data["branch"],
        min_cgpa=data["min_cgpa"],
        graduation_year=data["graduation_year"],
        package=data["package"],
        location=data["location"],
        deadline=datetime.strptime(
            data["deadline"],
            "%Y-%m-%d"
        ).date()
    )

    db.session.add(drive)
    db.session.commit()

    return jsonify({
        "message": "Drive Created Successfully",
        "status": "Pending Admin Approval"
    })

@company_bp.route("/company/applicants/<int:drive_id>", methods=["GET"])
@jwt_required()
def view_applicants(drive_id):

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(
        user_id=user_id
    ).first()

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    drive = PlacementDrive.query.filter_by(
        id=drive_id,
        company_id=company.id
    ).first()

    if not drive:
        return jsonify({
            "message": "Drive Not Found"
        }), 404

    applications = Application.query.filter_by(
        drive_id=drive.id
    ).all()

    result = []

    for application in applications:

        student = Student.query.get(application.student_id)

        result.append({
            "application_id": application.id,
            "student_name": student.full_name,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,
            "status": application.status,
            "resume": student.resume_path
        })

    return jsonify(result)

@company_bp.route("/company/application/<int:application_id>/status", methods=["PUT"])
@jwt_required()
def update_application_status(application_id):

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    data = request.get_json()

    status = data.get("status")

    allowed_status = [
        "Shortlisted",
        "Rejected",
        "Selected"
    ]

    if status not in allowed_status:
        return jsonify({
            "message": "Invalid Status"
        }), 400

    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "message": "Application Not Found"
        }), 404

    application.status = status

    db.session.commit()

    return jsonify({
        "message": "Application Status Updated Successfully",
        "new_status": status
    })

@company_bp.route("/company/drive/<int:drive_id>/applications", methods=["GET"])
@jwt_required()
def view_applications(drive_id):

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Only Companies Can View Applications"
        }), 403

    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(
        user_id=user_id
    ).first()

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    drive = PlacementDrive.query.filter_by(
        id=drive_id,
        company_id=company.id
    ).first()

    if not drive:
        return jsonify({
            "message": "Drive Not Found"
        }), 404
    
    print("Drive ID:", drive.id)      # 👈 ADD THIS

    applications = Application.query.filter_by(
        drive_id=drive.id
    ).all()

    print("Applications:", applications)      # 👈 ADD THIS
    print("Applications Count:", len(applications))   # 👈 ADD THIS

    applications = Application.query.filter_by(
        drive_id=drive.id
    ).all()

    result = []

    for application in applications:

        student = Student.query.get(application.student_id)

        result.append({
            "application_id": application.id,
            "student_name": student.full_name,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,
            "status": application.status,
            "resume": student.resume_path
        })

    return jsonify(result)

@company_bp.route("/company/dashboard", methods=["GET"])
@jwt_required()
def company_dashboard():

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(
        user_id=user_id
    ).first()

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    total_drives = PlacementDrive.query.filter_by(
        company_id=company.id
    ).count()

    pending_drives = PlacementDrive.query.filter_by(
        company_id=company.id,
        status="Pending"
    ).count()

    print("Company ID:", company.id)

    applications = 0

    drives = PlacementDrive.query.filter_by(
        company_id=company.id
    ).all()

    print("Total Drives:", len(drives))

    for drive in drives:

        print("Drive ID:", drive.id)

        count = Application.query.filter_by(
            drive_id=drive.id
        ).count()

        print("Applications for this drive:", count)

        applications += count

    print("Total Applications:", applications)

    return jsonify({
        "company": company.company_name,
        "total_drives": total_drives,
        "total_applications": applications,
        "pending_drives": pending_drives,
    })

@company_bp.route("/company/my-drives", methods=["GET"])
@jwt_required()
def my_drives():

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    company = Company.query.filter_by(
        user_id=user_id
    ).first()

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    drives = PlacementDrive.query.filter_by(
        company_id=company.id
    ).all()

    result = []

    for drive in drives:

        result.append({
            "id": drive.id,
            "job_title": drive.job_title,
            "branch": drive.branch,
            "min_cgpa": drive.min_cgpa,
            "graduation_year": drive.graduation_year,
            "package": drive.package,
            "location": drive.location,
            "status": drive.status,
            
        })

    return jsonify(result)

@company_bp.route("/company/application/<int:application_id>/schedule-interview", methods=["PUT"])
@jwt_required()
def schedule_interview(application_id):

    claims = get_jwt()

    if claims["role"] != "company":
        return jsonify({
            "message": "Access Denied"
        }), 403

    application = Application.query.get(application_id)

    if not application:
        return jsonify({
            "message": "Application Not Found"
        }), 404

    data = request.get_json()

    application.interview_date = datetime.strptime(
        data["interview_date"],
        "%Y-%m-%dT%H:%M"
    )

    application.interview_mode = data["interview_mode"]

    application.interview_link = data["interview_link"]

    db.session.commit()

    return jsonify({
        "message": "Interview Scheduled Successfully"
    })

@company_bp.route("/company/application/<int:application_id>/offer-letter", methods=["GET"])
@jwt_required()
def download_offer_letter(application_id):
    import os
    from datetime import date
    from flask import send_file

    application = Application.query.get(application_id)
    if not application:
        return jsonify({"message": "Application Not Found"}), 404

    if application.status != "Selected":
        return jsonify({"message": "Offer Letter is only available for Selected candidates"}), 403

    student = Student.query.get(application.student_id)
    drive = PlacementDrive.query.get(application.drive_id)
    company = Company.query.get(drive.company_id)

    export_folder = os.path.join(os.getcwd(), "exports")
    os.makedirs(export_folder, exist_ok=True)
    filename = f"offer_letter_{application_id}.pdf"
    filepath = os.path.join(export_folder, filename)

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        story = []

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=24,
            leading=28,
            textColor=colors.HexColor('#4f46e5'),
            alignment=1, # Center
            spaceAfter=20
        )

        meta_style = ParagraphStyle(
            'MetaStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )

        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=16,
            textColor=colors.HexColor('#334155'),
            spaceAfter=15
        )

        sig_style = ParagraphStyle(
            'SigStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=16,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=30
        )

        story.append(Paragraph(company.company_name, title_style))
        story.append(Paragraph(f"Date: {date.today().strftime('%B %d, %Y')}", meta_style))
        story.append(Spacer(1, 10))

        story.append(Paragraph(f"Dear {student.full_name},", body_style))
        story.append(Paragraph(
            f"We are pleased to offer you employment with <strong>{company.company_name}</strong> in the position of <strong>{drive.job_title}</strong>. "
            f"Based on your outstanding academic performance and CGPA of <strong>{student.cgpa}</strong>, we are confident in your potential contribution.",
            body_style
        ))

        story.append(Paragraph(
            f"Your annual compensation package will be <strong>{drive.package} LPA</strong>, and the job location will be <strong>{drive.location}</strong>. "
            f"Please verify this proposal as per the instructions provided by your institute's placement cell.",
            body_style
        ))

        story.append(Paragraph(
            "We look forward to welcoming you to our team.",
            body_style
        ))

        story.append(Spacer(1, 20))
        story.append(Paragraph("Sincerely,", body_style))
        story.append(Paragraph(f"HR Department<br/>{company.company_name}", sig_style))

        doc.build(story)
    except Exception as e:
        print("ReportLab error:", e)
        # Fallback to a simple text document if PDF generation fails
        with open(filepath, "w") as f:
            f.write(f"Offer Letter for {student.full_name}\nCompany: {company.company_name}\nPosition: {drive.job_title}\nPackage: {drive.package} LPA\nLocation: {drive.location}")

    return send_file(filepath, as_attachment=True, download_name=filename)