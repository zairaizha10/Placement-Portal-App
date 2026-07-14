import axios from "axios";

const API = axios.create({

    baseURL: "http://127.0.0.1:5000/api"

});

API.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {

        config.headers.Authorization = `Bearer ${token}`;

    }

    return config;

});

export const createDrive = (data) => {

    return API.post("/company/create-drive", data);

};

export const getMyDrives = () => {

    return API.get("/company/my-drives");

};

export const getApplicants = (driveId) => {

    return API.get(`/company/drive/${driveId}/applications`);

};

export const updateApplicationStatus = (id, status) => {

    return API.put(

        `/company/application/${id}/status`,

        {

            status

        }

    );

};

export const getCompanyDashboard = () => {

    return API.get("/company/dashboard");

};

export const scheduleInterview = (applicationId, data) => {

    return API.put(

        `/company/application/${applicationId}/schedule-interview`,

        data

    );

};