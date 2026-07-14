from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from extensions import db, cache
from models import User, Student, PlacementDrive, Application, Company



student_bp = Blueprint("student", __name__)



@student_bp.route("/student/apply/<int:drive_id>", methods=["POST"])
@jwt_required()
def apply_drive(drive_id):

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Only Students Can Apply"
        }), 403

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    if not student.is_active:
        return jsonify({
            "message": "Your account has been deactivated by Admin."
        }), 403

    if not student:
        return jsonify({
            "message": "Student Not Found"
        }), 404

    drive = PlacementDrive.query.get(drive_id)

    if not drive:
        return jsonify({
            "message": "Drive Not Found"
        }), 404

    if drive.status != "Approved":
        return jsonify({
            "message": "Drive Not Approved Yet"
        }), 400

    # Branch Check
    if student.branch != drive.branch:
        return jsonify({
            "message": "Branch Not Eligible"
        }), 400

    # CGPA Check
    if student.cgpa < drive.min_cgpa:
        return jsonify({
            "message": "CGPA Criteria Not Met"
        }), 400

    # Graduation Year Check
    if student.graduation_year != drive.graduation_year:
        return jsonify({
            "message": "Graduation Year Not Eligible"
        }), 400

    # Duplicate Application Check
    existing = Application.query.filter_by(
        student_id=student.id,
        drive_id=drive.id
    ).first()

    if existing:
        return jsonify({
            "message": "Already Applied"
        }), 400

    application = Application(
        student_id=student.id,
        drive_id=drive.id
    )

    db.session.add(application)
    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Application Submitted Successfully"
    })



@student_bp.route("/student/drives", methods=["GET"])
@jwt_required()
@cache.cached(timeout=60)
def view_drives():

    drives = PlacementDrive.query.filter_by(
        status="Approved"
    ).all()

    result = []

    for drive in drives:
        result.append({
            "id": drive.id,
            "company_id": drive.company_id,
            "job_title": drive.job_title,
            "job_description": drive.job_description,
            "branch": drive.branch,
            "min_cgpa": drive.min_cgpa,
            "graduation_year": drive.graduation_year,
            "package": drive.package,
            "location": drive.location,
            "deadline": str(drive.deadline)
        })

    return jsonify(result)

@student_bp.route("/student/search-drives", methods=["GET"])
@jwt_required()
def search_drives():

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Access Denied"
        }), 403

    keyword = request.args.get("keyword", "").strip()

    drives = PlacementDrive.query.filter(
        PlacementDrive.job_title.ilike(f"%{keyword}%"),
        PlacementDrive.status == "Approved"
    ).all()

    result = []

    for drive in drives:

        company = Company.query.get(drive.company_id)

        result.append({
            "drive_id": drive.id,
            "company": company.company_name,
            "job_title": drive.job_title,
            "branch": drive.branch,
            "min_cgpa": drive.min_cgpa,
            "package": drive.package,
            "location": drive.location,
            "deadline": str(drive.deadline)
        })

    return jsonify(result)

@student_bp.route("/student/applications", methods=["GET"])
@jwt_required()
def my_applications():

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    applications = Application.query.filter_by(
        student_id=student.id
    ).all()

    result = []

    for application in applications:

        drive = PlacementDrive.query.get(application.drive_id)

        company = Company.query.get(drive.company_id)

        result.append({
            "application_id": application.id,
            "company": company.company_name,
            "job_title": drive.job_title,
            "status": application.status,
            "applied_on": str(application.application_date),
            "interview_date": str(application.interview_date),
            "interview_mode": application.interview_mode,
            "interview_link": application.interview_link
        })

    return jsonify(result)

@student_bp.route("/student/resume", methods=["PUT"])
@jwt_required()
def update_resume():

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Only Students Can Update Resume"
        }), 403

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    if not student:
        return jsonify({
            "message": "Student Not Found"
        }), 404

    data = request.get_json()

    if "resume_url" not in data:
        return jsonify({
            "message": "Resume URL Required"
        }), 400

    student.resume_path = data["resume_url"]

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Resume Updated Successfully",
        "resume_url": student.resume_path
    })
    
@student_bp.route("/student/profile", methods=["GET"])
@jwt_required()
def profile():

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    user = User.query.get(user_id)

    return jsonify({
        "full_name": student.full_name,
        "email": user.email,
        "branch": student.branch,
        "cgpa": student.cgpa,
        "graduation_year": student.graduation_year,
        "phone": student.phone,
        "placement_status": student.placement_status,
        "resume": student.resume_path
    })

@student_bp.route("/student/profile", methods=["PUT"])
@jwt_required()
def update_profile():

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    if not student:
        return jsonify({
            "message": "Student Not Found"
        }), 404

    data = request.get_json()

    if "full_name" in data:
        student.full_name = data["full_name"]

    if "branch" in data:
        student.branch = data["branch"]

    if "cgpa" in data:
        student.cgpa = data["cgpa"]

    if "graduation_year" in data:
        student.graduation_year = data["graduation_year"]

    if "phone" in data:
        student.phone = data["phone"]

    db.session.commit()
    cache.clear()

    return jsonify({
        "message": "Profile Updated Successfully"
    })

@student_bp.route("/student/export-applications", methods=["POST"])
@jwt_required()
def export_applications():
    print("========== EXPORT API CALLED ==========")

    from tasks import export_student_applications

    claims = get_jwt()

    if claims["role"] != "student":
        return jsonify({
            "message": "Access Denied"
        }), 403

    user_id = int(get_jwt_identity())

    student = Student.query.filter_by(
        user_id=user_id
    ).first()

    if not student:
        return jsonify({
            "message": "Student Not Found"
        }), 404

    if not student.is_active:
        return jsonify({
            "message": "Your account has been deactivated by Admin."
        }), 403

    task = export_student_applications.delay(student.id)
    print("TASK ID:", task.id)

    return jsonify({
        "message": "CSV Export Started",
        "task_id": task.id
    }), 202

@student_bp.route("/student/export-download", methods=["GET"])
@jwt_required()
def download_export():
    import os
    from flask import send_file

    claims = get_jwt()
    if claims["role"] != "student":
        return jsonify({"message": "Access Denied"}), 403

    user_id = int(get_jwt_identity())
    student = Student.query.filter_by(user_id=user_id).first()
    if not student:
        return jsonify({"message": "Student Not Found"}), 404

    filename = f"student_{student.id}_applications.csv"
    filepath = os.path.join(os.getcwd(), "exports", filename)

    if os.path.exists(filepath):
        return send_file(filepath, as_attachment=True, download_name=filename)
    return jsonify({"message": "Export file not ready yet. Please try again."}), 404

@student_bp.route("/student/resume/check", methods=["POST"])
@jwt_required()
def check_resume_ats():
    claims = get_jwt()
    if claims["role"] != "student":
        return jsonify({"message": "Access Denied"}), 403

    data = request.get_json()
    resume_text = data.get("resume_text", "").strip()

    if not resume_text:
        return jsonify({"message": "Resume text is empty"}), 400

    # Skill keyword database
    core_skills = [
        "Python", "Flask", "SQL", "HTML", "CSS", "Javascript", "Vue",
        "React", "Git", "Docker", "Algorithms", "Testing", "Machine Learning", "Communication"
    ]

    matched_skills = []
    missing_skills = []
    
    # Simple case-insensitive matching
    for skill in core_skills:
        if skill.lower() in resume_text.lower():
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)


    base_score = 25
    score_per_skill = 6
    score = min(100, base_score + (len(matched_skills) * score_per_skill))

    suggestions = []
    if score < 50:
        suggestions.append("Your resume lacks essential core keywords. Consider listing specific libraries, languages, and technical frameworks.")
    if "git" in [s.lower() for s in missing_skills]:
        suggestions.append("Highlight source control skills by adding mentions of Git or GitHub repositories.")
    if "sql" in [s.lower() for s in missing_skills] or "flask" in [s.lower() for s in missing_skills]:
        suggestions.append("Add backend database project experience showcasing Flask and SQL query design.")
    if "communication" in [s.lower() for s in missing_skills]:
        suggestions.append("Incorporate soft-skills keywords such as 'Communication' or 'Collaboration' to detail team projects.")
    
    suggestions.append("Ensure your project accomplishments are listed with quantitative results (e.g. 'improved performance by 20%').")
    suggestions.append("Format work experiences with direct action verbs at the beginning of bullet points.")

    return jsonify({
        "score": score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    })