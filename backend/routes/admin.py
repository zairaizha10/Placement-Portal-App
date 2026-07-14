from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt

from extensions import db, cache
from models import User, Student, Company, PlacementDrive, Application

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/dashboard", methods=["GET"])
@jwt_required()
def dashboard():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    pending_companies = Company.query.filter_by(
        approval_status="Pending"
    ).count()

    pending_drives = PlacementDrive.query.filter_by(
        status="Pending"
    ).count()

    return jsonify({
        "students": Student.query.count(),
        "companies": Company.query.count(),
        "drives": PlacementDrive.query.count(),
        "pending_companies": pending_companies,
        "pending_drives": pending_drives
    })
@admin_bp.route("/admin/analytics", methods=["GET"])
@jwt_required()
@cache.cached(timeout=60)
def admin_analytics():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    total_students = Student.query.count()
    total_companies = Company.query.count()
    total_drives = PlacementDrive.query.count()

    total_applications = Application.query.count()

    selected_students = Application.query.filter_by(
        status="Selected"
    ).count()

    approved_companies = Company.query.filter_by(
        approval_status="Approved"
    ).count()

    approved_drives = PlacementDrive.query.filter_by(
        status="Approved"
    ).count()

    return jsonify({
        "total_students": total_students,
        "total_companies": total_companies,
        "approved_companies": approved_companies,
        "approved_drives": approved_drives,
        "total_drives": total_drives,
        "total_applications": total_applications,
        "selected_students": selected_students
    })

@admin_bp.route("/admin/companies/approved", methods=["GET"])
@jwt_required()
def approved_companies():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({"message": "Access Denied"}), 403

    companies = Company.query.filter_by(
        approval_status="Approved"
    ).all()

    result = []

    for company in companies:
        result.append({
            "id": company.id,
            "company_name": company.company_name,
            "hr_email": company.hr_email,
            "status": company.approval_status
        })

    return jsonify(result)


@admin_bp.route("/admin/company/<int:company_id>/approve", methods=["PUT"])
@jwt_required()
def approve_company(company_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    company = Company.query.get(company_id)

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    company.approval_status = "Approved"

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Company Approved Successfully"
    })

@admin_bp.route("/admin/companies/pending", methods=["GET"])
@jwt_required()
def pending_companies():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({"message": "Access Denied"}), 403

    companies = Company.query.filter_by(
        approval_status="Pending"
    ).all()

    result = []

    for company in companies:
        result.append({
            "id": company.id,
            "company_name": company.company_name,
            "hr_email": company.hr_email,
            "status": company.approval_status
        })

    return jsonify(result)

@admin_bp.route("/admin/company/<int:company_id>/reject", methods=["PUT"])
@jwt_required()
def reject_company(company_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    company = Company.query.get(company_id)

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    company.approval_status = "Rejected"

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Company Rejected Successfully"
    })

@admin_bp.route("/admin/drives/pending", methods=["GET"])
@jwt_required()
def pending_drives():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    drives = PlacementDrive.query.filter_by(
        status="Pending"
    ).all()

    result = []

    for drive in drives:
        result.append({
            "id": drive.id,
            "job_title": drive.job_title,
            "branch": drive.branch,
            "min_cgpa": drive.min_cgpa,
            "status": drive.status
        })

    return jsonify(result)

@admin_bp.route("/admin/drive/<int:drive_id>/approve", methods=["PUT"])
@jwt_required()
def approve_drive(drive_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    drive = PlacementDrive.query.get(drive_id)

    if not drive:
        return jsonify({
            "message": "Drive Not Found"
        }), 404

    drive.status = "Approved"

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Drive Approved Successfully"
    })

@admin_bp.route("/admin/drive/<int:drive_id>/reject", methods=["PUT"])
@jwt_required()
def reject_drive(drive_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    drive = PlacementDrive.query.get(drive_id)

    if not drive:
        return jsonify({
            "message": "Drive Not Found"
        }), 404

    drive.status = "Rejected"

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Drive Rejected Successfully"
    })

@admin_bp.route("/admin/search/students", methods=["GET"])
@jwt_required()
def search_students():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    keyword = request.args.get("keyword", "").strip()

    students = Student.query.filter(
        Student.full_name.ilike(f"%{keyword}%")
    ).all()

    result = []

    for student in students:
        result.append({
            "id": student.id,
            "name": student.full_name,
            "branch": student.branch,
            "cgpa": student.cgpa,
            "graduation_year": student.graduation_year,
            "placement_status": student.placement_status
        })

    return jsonify(result)

@admin_bp.route("/admin/search/companies", methods=["GET"])
@jwt_required()
def search_companies():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    keyword = request.args.get("keyword", "").strip()

    companies = Company.query.filter(
        Company.company_name.ilike(f"%{keyword}%")
    ).all()

    result = []

    for company in companies:
        result.append({
            "id": company.id,
            "company_name": company.company_name,
            "website": company.website,
            "approval_status": company.approval_status,
            "blacklisted": company.is_blacklisted
        })


    return jsonify(result)

@admin_bp.route("/admin/applications", methods=["GET"])
@jwt_required()
def view_all_applications():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    applications = Application.query.all()

    result = []

    for application in applications:

        student = Student.query.get(application.student_id)

        drive = PlacementDrive.query.get(application.drive_id)

        company = Company.query.get(drive.company_id)

        result.append({
            "application_id": application.id,
            "student_name": student.full_name,
            "company": company.company_name,
            "job_title": drive.job_title,
            "status": application.status,
            "applied_on": str(application.application_date)
        })

    return jsonify(result)

@admin_bp.route("/admin/company/<int:company_id>/blacklist", methods=["PUT"])
@jwt_required()
def blacklist_company(company_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    company = Company.query.get(company_id)

    if not company:
        return jsonify({
            "message": "Company Not Found"
        }), 404

    company.is_blacklisted = True

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Company Blacklisted Successfully"
    })

@admin_bp.route("/admin/student/<int:student_id>/deactivate", methods=["PUT"])
@jwt_required()
def deactivate_student(student_id):

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({
            "message": "Access Denied"
        }), 403

    student = Student.query.get(student_id)

    if not student:
        return jsonify({
            "message": "Student Not Found"
        }), 404

    student.is_active = False

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Student Deactivated Successfully"
    })

@admin_bp.route("/admin/drives/approved", methods=["GET"])
@jwt_required()
def approved_drives():

    claims = get_jwt()

    if claims["role"] != "admin":
        return jsonify({"message": "Access Denied"}), 403

    drives = PlacementDrive.query.filter_by(
        status="Approved"
    ).all()

    result = []

    for drive in drives:
        result.append({
            "id": drive.id,
            "job_title": drive.job_title,
            "branch": drive.branch,
            "min_cgpa": drive.min_cgpa,
            "status": drive.status
        })

    return jsonify(result)

@admin_bp.route("/admin/report/pdf", methods=["GET"])
@jwt_required()
def download_monthly_report_pdf():
    import os
    from datetime import date
    from flask import send_file

    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"message": "Access Denied"}), 403

    total_students = Student.query.count()
    total_companies = Company.query.count()
    total_drives = PlacementDrive.query.count()
    total_applications = Application.query.count()
    selected_students = Application.query.filter_by(status="Selected").count()
    shortlisted_students = Application.query.filter_by(status="Shortlisted").count()
    rejected_students = Application.query.filter_by(status="Rejected").count()

    export_folder = os.path.join(os.getcwd(), "exports")
    os.makedirs(export_folder, exist_ok=True)
    filename = f"monthly_report_{date.today().strftime('%Y_%m')}.pdf"
    filepath = os.path.join(export_folder, filename)

    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib import colors

        doc = SimpleDocTemplate(filepath, pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        story = []

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#1e293b'),
            alignment=1,
            spaceAfter=15
        )

        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#4f46e5'),
            spaceAfter=25
        )

        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )

        story.append(Paragraph("Placement Portal Activity Report", title_style))
        story.append(Paragraph(f"Generated on: {date.today().strftime('%B %d, %Y')}", subtitle_style))
        story.append(Spacer(1, 10))

        # Main summary table data
        data = [
            ['Metric Parameter', 'Count Value'],
            ['Total Registered Students', str(total_students)],
            ['Total Registered Companies', str(total_companies)],
            ['Total Placement Drives', str(total_drives)],
            ['Total Applications Filed', str(total_applications)],
            ['Successfully Placed Students', str(selected_students)],
            ['Shortlisted Candidates', str(shortlisted_students)],
            ['Rejected Registrations', str(rejected_students)],
        ]

        t = Table(data, colWidths=[300, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 11),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('TOPPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
            ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,1), (-1,-1), 10),
            ('TOPPADDING', (0,1), (-1,-1), 8),
            ('BOTTOMPADDING', (0,1), (-1,-1), 8),
        ]))
        
        story.append(t)
        story.append(Spacer(1, 30))

        story.append(Paragraph(
            "This report summarizes placement activities across companies, drives, and student applicants. "
            "It has been compiled programmatically from the SQLite database. If there are any discrepancies, "
            "please review the dashboard entries.",
            body_style
        ))

        doc.build(story)
    except Exception as e:
        print("ReportLab error:", e)
        with open(filepath, "w") as f:
            f.write(f"Monthly Placement Report\nDate: {date.today().strftime('%Y-%m-%d')}\nTotal Students: {total_students}\nTotal Drives: {total_drives}\nSelected: {selected_students}")

    return send_file(filepath, as_attachment=True, download_name=filename)

@admin_bp.route("/admin/report/html", methods=["GET"])
@jwt_required()
def download_monthly_report_html():
    claims = get_jwt()
    if claims["role"] != "admin":
        return jsonify({"message": "Access Denied"}), 403

    total_students = Student.query.count()
    total_companies = Company.query.count()
    total_drives = PlacementDrive.query.count()
    total_applications = Application.query.count()
    selected_students = Application.query.filter_by(status="Selected").count()
    shortlisted_students = Application.query.filter_by(status="Shortlisted").count()
    rejected_students = Application.query.filter_by(status="Rejected").count()

    from datetime import date
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Monthly Placement Report</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {{ font-family: 'Outfit', sans-serif; background: #f8fafc; padding: 3rem 1rem; }}
            .report-card {{ background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); max-width: 800px; margin: 0 auto; padding: 2.5rem; }}
        </style>
    </head>
    <body>
        <div class="report-card">
            <div class="text-center border-bottom pb-4 mb-4">
                <h2 class="fw-bold text-dark">Placement Activity Report</h2>
                <p class="text-muted mb-0">Generated on: {date.today().strftime('%B %d, %Y')}</p>
            </div>
            
            <table class="table table-bordered table-striped align-middle">
                <thead class="table-dark">
                    <tr>
                        <th class="py-3">Activity Parameter</th>
                        <th class="py-3 text-center">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td class="py-3">Total Registered Students</td><td class="text-center fw-bold text-primary py-3">{total_students}</td></tr>
                    <tr><td class="py-3">Total Registered Companies</td><td class="text-center fw-bold text-primary py-3">{total_companies}</td></tr>
                    <tr><td class="py-3">Total Placement Drives Conducted</td><td class="text-center fw-bold text-primary py-3">{total_drives}</td></tr>
                    <tr><td class="py-3">Total Student Applications Submitted</td><td class="text-center fw-bold text-primary py-3">{total_applications}</td></tr>
                    <tr><td class="py-3">Successfully Selected/Placed Students</td><td class="text-center fw-bold text-success py-3">{selected_students}</td></tr>
                    <tr><td class="py-3">Shortlisted Student Applications</td><td class="text-center fw-bold text-warning py-3">{shortlisted_students}</td></tr>
                    <tr><td class="py-3">Rejected Student Applications</td><td class="text-center fw-bold text-danger py-3">{rejected_students}</td></tr>
                </tbody>
            </table>
            
            <div class="mt-4 pt-3 text-center text-muted small border-top">
                Placement Portal System Report - Generated Automatically.
            </div>
        </div>
    </body>
    </html>
    """
    return html_content
