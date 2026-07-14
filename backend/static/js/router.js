const { createRouter, createWebHashHistory } = VueRouter;

import Login from './views/Login.js';
import Register from './views/Register.js';

import StudentDashboard from './views/student/Dashboard.js';
import StudentDrives from './views/student/Drives.js';
import StudentApplications from './views/student/Applications.js';
import StudentProfile from './views/student/Profile.js';
import StudentResume from './views/student/Resume.js';

import CompanyDashboard from './views/company/Dashboard.js';
import CompanyCreateDrive from './views/company/CreateDrive.js';
import CompanyMyDrives from './views/company/MyDrives.js';
import CompanyApplicants from './views/company/Applicants.js';

import AdminDashboard from './views/admin/Dashboard.js';
import AdminPendingCompanies from './views/admin/PendingCompanies.js';
import AdminPendingDrives from './views/admin/PendingDrives.js';
import AdminApprovedCompanies from './views/admin/ApprovedCompanies.js';
import AdminApprovedDrives from './views/admin/ApprovedDrives.js';
import AdminApplications from './views/admin/Applications.js';
import AdminAnalytics from './views/admin/Analytics.js';
import AdminSearchStudents from './views/admin/SearchStudents.js';
import AdminSearchCompanies from './views/admin/SearchCompanies.js';

const routes = [
    { path: '/', component: Login },
    { path: '/register', component: Register },
    { path: '/student/dashboard', component: StudentDashboard, meta: { role: 'student' } },
    { path: '/student/drives', component: StudentDrives, meta: { role: 'student' } },
    { path: '/student/applications', component: StudentApplications, meta: { role: 'student' } },
    { path: '/student/profile', component: StudentProfile, meta: { role: 'student' } },
    { path: '/student/resume', component: StudentResume, meta: { role: 'student' } },
    { path: '/company/dashboard', component: CompanyDashboard, meta: { role: 'company' } },
    { path: '/company/create-drive', component: CompanyCreateDrive, meta: { role: 'company' } },
    { path: '/company/my-drives', component: CompanyMyDrives, meta: { role: 'company' } },
    { path: '/company/applications/:driveId', component: CompanyApplicants, meta: { role: 'company' } },
    { path: '/admin/dashboard', component: AdminDashboard, meta: { role: 'admin' } },
    { path: '/admin/pending-companies', component: AdminPendingCompanies, meta: { role: 'admin' } },
    { path: '/admin/pending-drives', component: AdminPendingDrives, meta: { role: 'admin' } },
    { path: '/admin/approved-companies', component: AdminApprovedCompanies, meta: { role: 'admin' } },
    { path: '/admin/approved-drives', component: AdminApprovedDrives, meta: { role: 'admin' } },
    { path: '/admin/applications', component: AdminApplications, meta: { role: 'admin' } },
    { path: '/admin/analytics', component: AdminAnalytics, meta: { role: 'admin' } },
    { path: '/admin/search-students', component: AdminSearchStudents, meta: { role: 'admin' } },
    { path: '/admin/search-companies', component: AdminSearchCompanies, meta: { role: 'admin' } },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});


router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (to.meta.role) {
        if (!token) {
            next('/');
        } else if (to.meta.role !== role) {
            if (role === 'student') next('/student/dashboard');
            else if (role === 'company') next('/company/dashboard');
            else if (role === 'admin') next('/admin/dashboard');
            else next('/');
        } else {
            next();
        }
    } else {
        if (token && to.path === '/') {
            if (role === 'student') next('/student/dashboard');
            else if (role === 'company') next('/company/dashboard');
            else if (role === 'admin') next('/admin/dashboard');
        } else {
            next();
        }
    }
});

export default router;
