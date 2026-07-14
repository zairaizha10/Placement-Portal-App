import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:5000/api"
})

export function loginUser(data){
    return API.post("/login",data)
}

export function registerStudent(data){
    return API.post("/register/student",data)
}

export function registerCompany(data){
    return API.post("/register/company",data)
}

export default API;