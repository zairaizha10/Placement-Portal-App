import API from "./api";

// Student Profile
export const getStudentProfile = () => {
    return API.get("/student/profile");
};

// My Applications
export const getMyApplications = () => {
    return API.get("/student/applications");
};

// Available Placement Drives
export const getAvailableDrives = () => {
    return API.get("/student/drives");
};

// Apply for a Drive
export const applyDrive = (driveId) => {
    return API.post(`/student/apply/${driveId}`);
};

// Update Resume
export const updateResume = (resume_url) => {
    return API.put("/student/resume", {
        resume_url
    });
};