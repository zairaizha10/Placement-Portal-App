from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

from extensions import db
from models import User, Student, Company

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register/student", methods=["POST"])
def register_student():

    print(request.content_type)

    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        email=data["email"],
        role="student"
    )

    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    student = Student(
        user_id=user.id,
        full_name=data["full_name"],
        branch=data["branch"],
        cgpa=data["cgpa"],
        graduation_year=data["graduation_year"],
        phone=data.get("phone")

    )

    db.session.add(student)
    db.session.commit()

    return jsonify({
        "message": "Student Registered Successfully"
    })


@auth_bp.route("/register/company", methods=["POST"])
def register_company():

    data = request.get_json()

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        email=data["email"],
        role="company"
    )

    user.set_password(data["password"])

    db.session.add(user)
    db.session.commit()

    company = Company(
        user_id=user.id,
        company_name=data["company_name"],
        hr_name=data["hr_name"],
        hr_email=data["hr_email"],
        website=data["website"],
        description=data["description"]
    )

    db.session.add(company)
    db.session.commit()

    return jsonify({
        "message": "Company Registration Submitted"
    })


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    user = User.query.filter_by(
        email=data["email"]
    ).first()

    if not user:
        return jsonify({
            "message": "Invalid Email"
        }), 401

    if not check_password_hash(
            user.password,
            data["password"]
    ):
        return jsonify({
            "message": "Invalid Password"
        }), 401

    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "role": user.role
        }
    )

    return jsonify({
        "token": token,
        "role": user.role
    })