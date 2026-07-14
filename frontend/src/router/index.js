import {createRouter,createWebHistory} from "vue-router"

import Login from "../views/auth/Login.vue"

import Register from "../views/auth/Register.vue"

import StudentDashboard from "../views/student/StudentDashboard.vue";

import ViewDrives from "@/views/student/ViewDrives.vue";

import MyApplications from "../views/student/MyApplications.vue";

import Profile from "../views/student/Profile.vue";

import Resume from "../views/student/Resume.vue";

import CompanyDashboard from "../views/company/CompanyDashboard.vue";

import CreateDrive from "../views/company/CreateDrive.vue";

import MyDrives from "../views/company/MyDrives.vue"

import Applicants from "../views/company/Applicants.vue"

import AdminDashboard from "../views/admin/AdminDashboard.vue"

import Analytics from "../views/admin/Analytics.vue"

import Applications from "../views/admin/Applications.vue"

import ApprovedCompanies from "../views/admin/ApprovedCompanies.vue"

import ApprovedDrives from "../views/admin/ApprovedDrives.vue"

import PendingCompanies from "../views/admin/PendingCompanies.vue"

import PendingDrives from "../views/admin/PendingDrives.vue"

import SearchStudents from "../views/admin/SearchStudents.vue"

import SearchCompanies from "../views/admin/SearchCompanies.vue"

const routes=[

{

path:"/",

component:Login

},

{

path:"/register",

component:Register

},

{
    path: "/student/dashboard",
    component: StudentDashboard
},

{
    path: "/student/drives",
    component: ViewDrives
},

{
    path: "/student/applications",
    component: MyApplications
},

{
    path: "/student/profile",
    component: Profile
},

{
    path: "/student/resume",
    component: Resume
},

{
    path: "/company/dashboard",
    component: CompanyDashboard
},

{
    path: "/company/create-drive",
    component: CreateDrive
},

{
    path:"/company/my-drives",
    component:MyDrives
},

{
    path:"/company/applications/:driveId",
    component:Applicants
},

{
path:"/admin/dashboard",
component:AdminDashboard
},

{
path:"/admin/analytics",
component:Analytics
},

{
path:"/admin/applications",
component:Applications
},

{
path:"/admin/approved-companies",
component:ApprovedCompanies
},

{
path:"/admin/approved-drives",
component:ApprovedDrives
},

{
path:"/admin/pending-companies",
component:PendingCompanies
},

{
path:"/admin/pending-drives",
component:PendingDrives
},

{
path:"/admin/search-students",
component:SearchStudents
},

{
path:"/admin/search-companies",
component:SearchCompanies
},

]

const router=createRouter({

history:createWebHistory(),

routes

})

router.beforeEach((to, from, next) => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (to.path === "/" || to.path === "/register") {
        return next();
    }
    if (!token) {
        return next("/");
    }

    if (to.path.startsWith("/student") && role !== "student") {
        return next("/");
    }

    if (to.path.startsWith("/company") && role !== "company") {
        return next("/");
    }

    if (to.path.startsWith("/admin") && role !== "admin") {
        return next("/");
    }

    next();

});

export default router