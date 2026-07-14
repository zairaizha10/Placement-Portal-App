import csv
from fileinput import filename
import os

from celery_app import celery

from models import Student, Application, PlacementDrive, Company, User
from datetime import date, timedelta
from flask_mail import Message
from extensions import mail



@celery.task
def test_task():
    return "Task Working"


@celery.task
def export_student_applications(student_id):


        student = Student.query.get(student_id)

        if not student:
            return "Student Not Found"

        applications = Application.query.filter_by(
            student_id=student.id
        ).all()

        export_folder = os.path.join(
            os.getcwd(),
            "exports"
        )

        os.makedirs(export_folder, exist_ok=True)

        filename = f"student_{student.id}_applications.csv"

        filepath = os.path.join(
            export_folder,
            filename
        )

        with open(
            filepath,
            "w",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.writer(file)

            writer.writerow([
                "Application ID",
                "Company",
                "Job Title",
                "Status",
                "Application Date"
            ])

            for application in applications:

                drive = PlacementDrive.query.get(application.drive_id)

                company = Company.query.get(drive.company_id)

                writer.writerow([
                    application.id,
                    company.company_name,
                    drive.job_title,
                    application.status,
                    application.application_date
                ])

        user = User.query.get(student.user_id)

        msg = Message(
            subject="Placement Applications Export Ready",
            recipients=[user.email]
        )

        msg.body = f"""
        Hello {student.full_name},

        Your Placement Application CSV has been generated successfully.

        You can now download it from your Placement Portal dashboard.

        Regards,
        Placement Portal
        """

        with open(filepath, "rb") as f:
            msg.attach(
                filename,
                "text/csv",
                f.read()
            )

        mail.send(msg)        

        return filepath

@celery.task
def send_deadline_reminders():
    tomorrow = date.today() + timedelta(days=1)

    drives = PlacementDrive.query.filter_by(
        status="Approved"
    ).filter(
        PlacementDrive.deadline == tomorrow
    ).all()

    emails_sent = 0

    for drive in drives:
        eligible_students = Student.query.filter_by(
            is_active=True,
            branch=drive.branch,
            graduation_year=drive.graduation_year
        ).filter(
            Student.cgpa >= drive.min_cgpa
        ).all()

        for student in eligible_students:
            # Check if they have not applied yet
            already_applied = Application.query.filter_by(
                student_id=student.id,
                drive_id=drive.id
            ).first()

            if not already_applied:
                user = User.query.get(student.user_id)
                if not user:
                    continue

                msg = Message(
                    subject=f"Application Deadline Reminder: {drive.job_title}",
                    recipients=[user.email]
                )

                msg.html = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #4f46e5; margin-bottom: 10px;">Upcoming Job Drive Deadline</h2>
                    <p>Dear <strong>{student.full_name}</strong>,</p>
                    <p>This is a reminder that you are eligible for the upcoming placement drive:</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #e2e8f0;">
                        <h3 style="margin: 0 0 10px 0; color: #1e293b;">{drive.job_title}</h3>
                        <p style="margin: 0 0 5px 0;"><strong>Branch:</strong> {drive.branch}</p>
                        <p style="margin: 0 0 5px 0;"><strong>Min CGPA Required:</strong> {drive.min_cgpa}</p>
                        <p style="margin: 0;"><strong>Compensation:</strong> {drive.package} LPA</p>
                    </div>
                    <p style="color: #ef4444; font-weight: bold;">The application deadline is tomorrow, {drive.deadline}.</p>
                    <p>Please log in to the Placement Portal to apply before the registration window closes.</p>
                    <p style="margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                        Placement Portal Notifications - This email was sent automatically.
                    </p>
                </div>
                """

                mail.send(msg)
                emails_sent += 1

    return f"Deadline Reminder: Sent {emails_sent} HTML Emails"

@celery.task
def send_monthly_admin_report():
    total_students = Student.query.count()
    total_companies = Company.query.count()
    total_drives = PlacementDrive.query.count()
    total_applications = Application.query.count()

    selected_students = Application.query.filter_by(
        status="Selected"
    ).count()

    admin = User.query.filter_by(
        role="admin"
    ).first()

    if not admin:
        return "Admin Not Found"

    msg = Message(
        subject="Monthly Placement Portal Activity Report",
        recipients=[admin.email]
    )

    msg.html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; margin-bottom: 20px;">Monthly Placement Report</h2>
        <p>Hello Admin,</p>
        <p>Here are the recruitment portal activity statistics for the past month:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #1e293b; color: white;">
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: left;">Activity Metric</th>
                <th style="padding: 10px; border: 1px solid #e2e8f0; text-align: center;">Value</th>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">Students Registered</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #4f46e5;">{total_students}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">Companies Registered</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #4f46e5;">{total_companies}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">Placement Drives Conducted</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #4f46e5;">{total_drives}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #e2e8f0;">Student Applications Submitted</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #4f46e5;">{total_applications}</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
                <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Candidates Placed/Selected</td>
                <td style="padding: 10px; border: 1px solid #e2e8f0; text-align: center; font-weight: bold; color: #10b981;">{selected_students}</td>
            </tr>
        </table>
        <p style="margin-top: 30px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">
            Placement Portal Automated Reporting System - Monthly Summary.
        </p>
    </div>
    """

    mail.send(msg)

    return "Monthly Activity Report Sent to Admin"