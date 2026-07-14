import axios from "axios"

const API=axios.create({

baseURL:"http://127.0.0.1:5000/api"

})

API.interceptors.request.use(config=>{

config.headers.Authorization=

"Bearer "+localStorage.getItem("token")

return config

})

export const getDashboard=()=>API.get("/admin/dashboard")

export const getPendingCompanies=()=>API.get("/admin/companies/pending")

export const approveCompany=id=>API.put(`/admin/company/${id}/approve`)

export const rejectCompany=id=>API.put(`/admin/company/${id}/reject`)

export const getPendingDrives=()=>API.get("/admin/drives/pending")

export const approveDrive=id=>API.put(`/admin/drive/${id}/approve`)

export const rejectDrive=id=>API.put(`/admin/drive/${id}/reject`)

export const getApprovedCompanies=()=>API.get("/admin/companies/approved")

export const getApprovedDrives=()=>API.get("/admin/drives/approved")

export const getAllApplications=()=>API.get("/admin/applications")

export const getAnalytics=()=>API.get("/admin/analytics")

export const searchStudents=keyword=>

API.get(`/admin/search/students?keyword=${keyword}`)

export const searchCompanies=keyword=>

API.get(`/admin/search/companies?keyword=${keyword}`)