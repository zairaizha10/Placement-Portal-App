
async function apiFetch(url, options = {}) {
    options.headers = options.headers || {};
    const token = localStorage.getItem('token');
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    
    
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(options.body);
    }
    
    const response = await fetch(url, options);
    

    if (response.status === 401 || response.status === 422) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.hash = '#/';
        throw new Error('Session expired. Please log in again.');
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'API request failed.');
        }
        return data;
    } else {
        if (!response.ok) {
            throw new Error('API request failed.');
        }
        return response; 
    }
}


const Login = {
    name: 'Login',
    data() {
        return {
            email: '',
            password: '',
            errorMessage: '',
            loading: false
        };
    },
    methods: {
        async handleLogin() {
            if (!this.email || !this.password) {
                this.errorMessage = 'Please enter both email and password.';
                return;
            }
            this.loading = true;
            this.errorMessage = '';
            try {
                const data = await apiFetch('/api/login', {
                    method: 'POST',
                    body: { email: this.email, password: this.password }
                });
                
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                
                if (data.role === 'student') {
                    this.$router.push('/student/dashboard');
                } else if (data.role === 'company') {
                    this.$router.push('/company/dashboard');
                } else if (data.role === 'admin') {
                    this.$router.push('/admin/dashboard');
                }
            } catch (error) {
                console.error(error);
                this.errorMessage = error.message || 'Login failed. Please check your credentials.';
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="auth-wrapper">
        <div class="auth-card fade-in">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 60px; height: 60px;">
                    <i class="bi bi-person-badge fs-2"></i>
                </div>
                <h2 class="fw-bold text-dark">Placement Portal</h2>
                <p class="text-muted subtitle">Institute Recruitment System</p>
            </div>

            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center py-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMessage }}</div>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="email" class="form-label text-secondary fw-semibold">Email address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                        <input type="email" id="email" class="form-control border-start-0 ps-0" placeholder="admin@placement.com" v-model="email" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="password" class="form-label text-secondary fw-semibold">Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-lock text-muted"></i></span>
                        <input type="password" id="password" class="form-control border-start-0 ps-0" placeholder="••••••••" v-model="password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold text-white rounded-3 shadow-sm mb-3" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-else>Sign In</span>
                </button>
            </form>

            <div class="text-center">
                <p class="mb-0 text-muted">New user? 
                    <router-link to="/register" class="text-primary fw-semibold text-decoration-none">Create an Account</router-link>
                </p>
            </div>
        </div>
    </div>
    `
};

const Register = {
    name: 'Register',
    data() {
        return {
            role: 'student',
            loading: false,
            errorMessage: '',
            successMessage: '',
            studentData: {
                full_name: '',
                branch: '',
                graduation_year: '',
                cgpa: '',
                phone: '',
                email: '',
                password: ''
            },
            companyData: {
                company_name: '',
                hr_name: '',
                hr_email: '',
                website: '',
                description: '',
                email: '',
                password: ''
            }
        };
    },
    methods: {
        async handleRegister() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';
            try {
                if (this.role === 'student') {
                    const data = await apiFetch('/api/register/student', {
                        method: 'POST',
                        body: this.studentData
                    });
                    this.successMessage = data.message || 'Student registration successful!';
                } else {
                    const data = await apiFetch('/api/register/company', {
                        method: 'POST',
                        body: this.companyData
                    });
                    this.successMessage = data.message || 'Company registration submitted for approval!';
                }
                setTimeout(() => {
                    this.$router.push('/');
                }, 2000);
            } catch (error) {
                console.error(error);
                this.errorMessage = error.message || 'Registration failed. Please check inputs.';
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="auth-wrapper py-5">
        <div class="auth-card fade-in" style="max-width: 600px;">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 50px; height: 50px;">
                    <i class="bi bi-person-plus fs-3"></i>
                </div>
                <h3 class="fw-bold text-dark mb-1">Create an Account</h3>
                <p class="text-muted small">Join our Recruitment Portal</p>
            </div>

            <div class="d-flex justify-content-center gap-2 mb-4">
                <button type="button" class="btn px-4 py-2 fw-semibold rounded-3 flex-grow-1"
                    :class="role === 'student' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'"
                    @click="role = 'student'">
                    <i class="bi bi-mortarboard me-2"></i>Student
                </button>
                <button type="button" class="btn px-4 py-2 fw-semibold rounded-3 flex-grow-1"
                    :class="role === 'company' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'"
                    @click="role = 'company'">
                    <i class="bi bi-building me-2"></i>Company
                </button>
            </div>

            <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success py-2 small" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            </div>

            <form @submit.prevent="handleRegister">
                <div v-if="role === 'student'">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Full Name</label>
                        <input type="text" class="form-control" placeholder="John Doe" v-model="studentData.full_name" required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Branch/Major</label>
                            <input type="text" class="form-control" placeholder="Computer Science" v-model="studentData.branch" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Graduation Year</label>
                            <input type="number" class="form-control" placeholder="2026" v-model="studentData.graduation_year" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" placeholder="9.5" v-model="studentData.cgpa" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Phone Number</label>
                            <input type="tel" class="form-control" placeholder="9876543210" v-model="studentData.phone" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Email Address</label>
                        <input type="email" class="form-control" placeholder="john@student.com" v-model="studentData.email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-secondary fw-semibold small">Password</label>
                        <input type="password" class="form-control" placeholder="••••••••" v-model="studentData.password" required>
                    </div>
                </div>

                <div v-if="role === 'company'">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Name</label>
                        <input type="text" class="form-control" placeholder="Acme Corporation" v-model="companyData.company_name" required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">HR Contact Name</label>
                            <input type="text" class="form-control" placeholder="Alice Smith" v-model="companyData.hr_name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">HR Contact Email</label>
                            <input type="email" class="form-control" placeholder="hr@acme.com" v-model="companyData.hr_email" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Website</label>
                        <input type="url" class="form-control" placeholder="https://acme.com" v-model="companyData.website" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Description</label>
                        <textarea class="form-control" rows="3" placeholder="Provide a brief description of your company..." v-model="companyData.description" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Account Login Email</label>
                        <input type="email" class="form-control" placeholder="hr_login@acme.com" v-model="companyData.email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-secondary fw-semibold small">Password</label>
                        <input type="password" class="form-control" placeholder="••••••••" v-model="companyData.password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold text-white rounded-3 mb-3" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-else>Register</span>
                </button>
            </form>

            <div class="text-center">
                <p class="mb-0 text-muted small">Already have an account? 
                    <router-link to="/" class="text-primary fw-semibold text-decoration-none">Sign In</router-link>
                </p>
            </div>
        </div>
    </div>
    `
};

const StudentDashboard = {
    name: 'StudentDashboard',
    data() {
        return {
            profile: null,
            totalApplications: 0,
            availableDrives: 0,
            loading: true
        };
    },
    async mounted() {
        try {
            const [profileData, appsData, drivesData] = await Promise.all([
                apiFetch('/api/student/profile'),
                apiFetch('/api/student/applications'),
                apiFetch('/api/student/drives')
            ]);
            this.profile = profileData;
            this.totalApplications = appsData.length;
            this.availableDrives = drivesData.length;
        } catch (error) {
            console.error('Error fetching student dashboard stats:', error);
        } finally {
            this.loading = false;
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                <span>Student Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/student/dashboard" class="sidebar-nav-link active">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-pdf"></i> Resume
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Student Dashboard</h2>
                    <p class="text-muted" v-if="profile">Welcome back, <span class="fw-semibold text-primary">{{ profile.full_name }}</span> 👋</p>
                </div>
                <div class="d-flex align-items-center gap-3" v-if="profile">
                    <span class="badge bg-light text-dark p-2 border">Grad Year: {{ profile.graduation_year }}</span>
                    <span class="badge bg-light text-dark p-2 border">CGPA: {{ profile.cgpa }}</span>
                </div>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading your recruitment information...</p>
            </div>

            <div v-else class="fade-in">
                <div class="row g-4 mb-5">
                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-file-earmark-arrow-up fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Total Applied</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ totalApplications }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-info text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-building fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Available Drives</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ availableDrives }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-award fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Placement Status</h6>
                                <h3 class="fw-bold mb-0" :class="profile && profile.placement_status === 'Placed' ? 'text-success' : 'text-warning'">
                                    {{ profile ? profile.placement_status : 'Not Placed' }}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 bg-white shadow-sm p-4 rounded-4 mb-4">
                    <div class="d-flex align-items-start gap-3">
                        <div class="bg-primary-subtle text-primary rounded-3 p-2">
                            <i class="bi bi-info-circle fs-3"></i>
                        </div>
                        <div>
                            <h5 class="fw-bold text-dark">Recruitment Guidelines</h5>
                            <p class="text-secondary mb-0">Ensure that your profile details and CGPA match your official records before applying. You can modify your resume at any time from the Resume tab. Remember, once you apply to a drive, your registration is final and verified automatically based on the drive eligibility criteria.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};

const StudentDrives = {
    name: 'StudentDrives',
    data() {
        return {
            drives: [],
            keyword: '',
            loading: true,
            alertMsg: '',
            alertType: 'success',
            debounceTimeout: null
        };
    },
    mounted() {
        this.loadDrives();
    },
    watch: {
        keyword() {
            if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.loadDrives();
            }, 350);
        }
    },
    methods: {
        async loadDrives() {
            this.loading = true;
            try {
                let data;
                if (this.keyword.trim()) {
                    data = await apiFetch(`/api/student/search-drives?keyword=${encodeURIComponent(this.keyword)}`);
                    this.drives = data.map(d => ({
                        id: d.drive_id || d.id,
                        company_name: d.company || 'Company',
                        job_title: d.job_title,
                        branch: d.branch,
                        min_cgpa: d.min_cgpa,
                        package: d.package,
                        location: d.location,
                        deadline: d.deadline
                    }));
                } else {
                    data = await apiFetch('/api/student/drives');
                    this.drives = data;
                }
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleApply(driveId) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/student/apply/${driveId}`, {
                    method: 'POST'
                });
                this.alertMsg = data.message || 'Successfully applied!';
                this.alertType = 'success';
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Eligibility check failed or already applied.';
                this.alertType = 'danger';
            }
            setTimeout(() => {
                this.alertMsg = '';
            }, 4000);
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                <span>Student Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/student/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/drives" class="sidebar-nav-link active">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-pdf"></i> Resume
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Placement Drives</h2>
                <p class="text-muted">Browse and apply to active job recruitments</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div class="mb-4">
                <div class="input-group" style="max-width: 500px;">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Search by job title..." v-model="keyword" @keyup.enter="loadDrives">
                    <button class="btn btn-primary" type="button" @click="loadDrives">Search</button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Fetching active placement drives...</p>
            </div>

            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-briefcase text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Placement Drives Found</h5>
                <p class="text-secondary mb-0">There are no approved placement drives matching your search.</p>
            </div>

            <div v-else class="row g-4 fade-in">
                <div class="col-md-6 col-lg-4" v-for="drive in drives" :key="drive.id">
                    <div class="card border border-light shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="fw-bold text-dark mb-0">{{ drive.job_title }}</h5>
                                <small class="text-muted d-block mt-1">
                                    <i class="bi bi-building me-1"></i>{{ drive.company_name }}
                                </small>
                            </div>
                            <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold">{{ drive.package }} LPA</span>
                        </div>

                        <div class="mb-3 border-top border-bottom py-2">
                            <div class="d-flex justify-content-between small text-secondary mb-1">
                                <span><i class="bi bi-geo-alt me-1"></i>Location:</span>
                                <span class="fw-semibold text-dark">{{ drive.location }}</span>
                            </div>
                            <div class="d-flex justify-content-between small text-secondary mb-1">
                                <span><i class="bi bi-mortarboard me-1"></i>Branch Eligible:</span>
                                <span class="fw-semibold text-dark">{{ drive.branch }}</span>
                            </div>
                            <div class="d-flex justify-content-between small text-secondary mb-1">
                                <span><i class="bi bi-journal-check me-1"></i>Min CGPA:</span>
                                <span class="fw-semibold text-dark">{{ drive.min_cgpa }}</span>
                            </div>
                            <div class="d-flex justify-content-between small text-secondary">
                                <span><i class="bi bi-calendar-event me-1"></i>Deadline:</span>
                                <span class="fw-semibold text-danger">{{ drive.deadline }}</span>
                            </div>
                        </div>

                        <button @click="handleApply(drive.id)" class="btn btn-primary w-100 py-2 fw-semibold rounded-3 text-white mt-auto">
                            Apply Now
                        </button>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};

const StudentApplications = {
    name: 'StudentApplications',
    data() {
        return {
            applications: [],
            loading: true,
            csvLoading: false,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadApplications();
    },
    methods: {
        async loadApplications() {
            try {
                const data = await apiFetch('/api/student/applications');
                this.applications = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async triggerCSVExport() {
            this.csvLoading = true;
            this.alertMsg = '';
            try {
                await apiFetch('/api/student/export-applications', { method: 'POST' });
                this.alertMsg = 'CSV export batch job triggered successfully! Fetching your download file...';
                this.alertType = 'success';

                setTimeout(() => {
                    window.open('/api/student/export-download', '_blank');
                    this.csvLoading = false;
                }, 2000);
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to trigger CSV export.';
                this.alertType = 'danger';
                this.csvLoading = false;
            }
        },
        downloadOfferLetter(appId) {
            window.open(`/api/company/application/${appId}/offer-letter`, '_blank');
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                <span>Student Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/student/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link active">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-pdf"></i> Resume
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">My Applications</h2>
                    <p class="text-muted">Track your job applications and recruitment status</p>
                </div>
                <button @click="triggerCSVExport" class="btn btn-success d-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold rounded-3 shadow-sm" :disabled="csvLoading">
                    <span v-if="csvLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-file-earmark-spreadsheet"></i>
                    Export History (CSV)
                </button>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading applications...</p>
            </div>

            <div v-else-if="applications.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-file-earmark-text text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Applications Found</h5>
                <p class="text-secondary mb-3">You have not applied for any placement drives yet.</p>
                <router-link to="/student/drives" class="btn btn-primary px-4 text-white fw-semibold rounded-3 shadow-sm">Browse Drives</router-link>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Company</th>
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Applied On</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3">Details / Offer Letter</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in applications" :key="app.application_id">
                            <td class="fw-semibold text-dark">{{ app.company }}</td>
                            <td>{{ app.job_title }}</td>
                            <td class="text-secondary small">{{ app.applied_on ? app.applied_on.split(' ')[0] : 'N/A' }}</td>
                            <td class="text-center">
                                <span class="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                                    :class="{
                                        'bg-primary-subtle text-primary': app.status === 'Applied',
                                        'bg-warning-subtle text-warning': app.status === 'Shortlisted',
                                        'bg-success-subtle text-success': app.status === 'Selected',
                                        'bg-danger-subtle text-danger': app.status === 'Rejected'
                                    }">
                                    {{ app.status }}
                                </span>
                            </td>
                            <td>
                                <button v-if="app.status === 'Selected'" @click="downloadOfferLetter(app.application_id)" class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 py-1 px-3 rounded-pill fw-semibold">
                                    <i class="bi bi-download"></i> Offer Letter (PDF)
                                </button>
                                <div v-else-if="app.status === 'Shortlisted' && app.interview_date" class="small bg-warning-subtle text-warning-emphasis p-2 rounded-3" style="max-width: 300px;">
                                    <h6 class="fw-bold mb-1" style="font-size: 0.85rem;"><i class="bi bi-calendar-event me-1"></i>Interview Scheduled</h6>
                                    <div class="mb-1"><strong>Time:</strong> {{ app.interview_date.replace('T', ' ') }}</div>
                                    <div class="mb-1"><strong>Mode:</strong> {{ app.interview_mode }}</div>
                                    <div v-if="app.interview_link"><strong>Link:</strong> <a :href="app.interview_link" target="_blank" class="text-break">{{ app.interview_link }}</a></div>
                                </div>
                                <span v-else class="text-muted small">No immediate actions required</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const StudentProfile = {
    name: 'StudentProfile',
    data() {
        return {
            profile: {
                full_name: '',
                email: '',
                branch: '',
                cgpa: 0,
                graduation_year: 0,
                phone: '',
                placement_status: '',
                resume: ''
            },
            editing: false,
            loading: true,
            saving: false,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadProfile();
    },
    methods: {
        async loadProfile() {
            try {
                const data = await apiFetch('/api/student/profile');
                this.profile = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleUpdate() {
            this.saving = true;
            this.alertMsg = '';
            try {
                const data = await apiFetch('/api/student/profile', {
                    method: 'PUT',
                    body: {
                        full_name: this.profile.full_name,
                        branch: this.profile.branch,
                        cgpa: parseFloat(this.profile.cgpa),
                        graduation_year: parseInt(this.profile.graduation_year),
                        phone: this.profile.phone
                    }
                });
                this.alertMsg = data.message || 'Profile updated successfully!';
                this.alertType = 'success';
                this.editing = false;
                this.loadProfile();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to update profile details.';
                this.alertType = 'danger';
            } finally {
                this.saving = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                <span>Student Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/student/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link active">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-pdf"></i> Resume
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">My Profile</h2>
                <p class="text-muted">Manage your personal and academic information</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading profile details...</p>
            </div>

            <div v-else class="card border-0 bg-white shadow-sm rounded-4 p-4 fade-in" style="max-width: 800px;">
                <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-dark mb-0">Personal Profile File</h5>
                    <button v-if="!editing" @click="editing = true" class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold">
                        <i class="bi bi-pencil me-1"></i> Edit Profile
                    </button>
                </div>

                <form @submit.prevent="handleUpdate">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Full Name</label>
                            <input type="text" class="form-control" v-model="profile.full_name" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Email Address</label>
                            <input type="email" class="form-control bg-light" v-model="profile.email" disabled>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Academic Branch</label>
                            <input type="text" class="form-control" v-model="profile.branch" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Current CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" v-model="profile.cgpa" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Graduation Year</label>
                            <input type="number" class="form-control" v-model="profile.graduation_year" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Phone Number</label>
                            <input type="tel" class="form-control" v-model="profile.phone" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Placement Status</label>
                            <span class="d-block py-2 fw-semibold" :class="profile.placement_status === 'Placed' ? 'text-success' : 'text-warning'">
                                {{ profile.placement_status }}
                            </span>
                        </div>
                    </div>

                    <div v-if="editing" class="d-flex justify-content-end gap-2 border-top pt-3">
                        <button type="button" @click="editing = false" class="btn btn-outline-secondary px-4 rounded-pill fw-semibold">Cancel</button>
                        <button type="submit" class="btn btn-primary px-4 text-white rounded-pill fw-semibold shadow-sm" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
    `
};

const StudentResume = {
    name: 'StudentResume',
    data() {
        return {
            resumeUrl: '',
            resumeText: '',
            loading: true,
            saving: false,
            scanLoading: false,
            scanned: false,
            atsScore: 0,
            matchedSkills: [],
            missingSkills: [],
            suggestions: [],
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadResume();
    },
    methods: {
        async loadResume() {
            try {
                const data = await apiFetch('/api/student/profile');
                this.resumeUrl = data.resume || '';
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleSave() {
            this.saving = true;
            this.alertMsg = '';
            try {
                const data = await apiFetch('/api/student/resume', {
                    method: 'PUT',
                    body: { resume_url: this.resumeUrl }
                });
                this.alertMsg = data.message || 'Resume URL updated successfully!';
                this.alertType = 'success';
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to update resume.';
                this.alertType = 'danger';
            } finally {
                this.saving = false;
            }
        },
        async runATSCheck() {
            if (!this.resumeText.trim()) {
                alert('Please paste your resume text to evaluate compatibility.');
                return;
            }
            this.scanLoading = true;
            this.scanned = false;
            try {
                const data = await apiFetch('/api/student/resume/check', {
                    method: 'POST',
                    body: { resume_text: this.resumeText }
                });
                this.atsScore = data.score;
                this.matchedSkills = data.matched_skills;
                this.missingSkills = data.missing_skills;
                this.suggestions = data.suggestions;
                this.scanned = true;
            } catch (error) {
                console.error(error);
                alert('ATS evaluation encountered an error.');
            } finally {
                this.scanLoading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-mortarboard-fill text-primary fs-3"></i>
                <span>Student Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/student/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link active">
                        <i class="bi bi-file-earmark-pdf"></i> Resume
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Resume Management</h2>
                <p class="text-muted">Upload your CV profile and test it with our ATS score scanner</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading resume profile...</p>
            </div>

            <div v-else class="row g-4 fade-in">
                <div class="col-md-5">
                    <div class="card border-0 bg-white shadow-sm rounded-4 p-4 mb-4">
                        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">Resume URL</h5>
                        <form @submit.prevent="handleSave">
                            <div class="mb-3">
                                <label class="form-label text-secondary small fw-semibold">Hosted Resume Link</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white"><i class="bi bi-link-45deg text-muted"></i></span>
                                    <input type="url" class="form-control" placeholder="https://drive.google.com/..." v-model="resumeUrl" required>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary px-4 text-white fw-semibold rounded-pill shadow-sm" :disabled="saving">
                                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Save Link
                            </button>
                        </form>

                        <div class="mt-4 pt-3 border-top" v-if="resumeUrl">
                            <a :href="resumeUrl" target="_blank" class="btn btn-outline-secondary w-100 py-2 rounded-3 fw-semibold">
                                <i class="bi bi-file-earmark-pdf me-2"></i> View Current Resume
                            </a>
                        </div>
                    </div>
                </div>

                <div class="col-md-7">
                    <div class="card border-0 bg-white shadow-sm rounded-4 p-4">
                        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                            <i class="bi bi-robot text-primary me-2"></i>ATS Resume Scanner
                        </h5>
                        <p class="text-muted small">Copy and paste your resume text below to analyze compatibility against benchmarks.</p>
                        
                        <div class="mb-3">
                            <textarea class="form-control" rows="6" placeholder="Paste resume contents here..." v-model="resumeText"></textarea>
                        </div>
                        
                        <button type="button" @click="runATSCheck" class="btn btn-outline-primary px-4 fw-semibold rounded-pill mb-4" :disabled="scanLoading">
                            <span v-if="scanLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <i v-else class="bi bi-activity me-1"></i> Scan Resume Compatibility
                        </button>

                        <div v-if="scanned" class="bg-light p-3 rounded-4 border fade-in">
                            <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                                <h6 class="fw-bold text-dark mb-0">ATS Score Evaluation</h6>
                                <span class="badge fs-5 rounded-pill px-3"
                                    :class="{
                                        'bg-danger': atsScore < 50,
                                        'bg-warning text-dark': atsScore >= 50 && atsScore < 75,
                                        'bg-success': atsScore >= 75
                                    }">
                                    {{ atsScore }}/100
                                </span>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6 mb-3">
                                    <strong class="text-success small d-block mb-2">Matched Skills:</strong>
                                    <div class="d-flex flex-wrap gap-1" v-if="matchedSkills.length > 0">
                                        <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill small fw-normal" v-for="skill in matchedSkills">{{ skill }}</span>
                                    </div>
                                    <span v-else class="text-muted small">None.</span>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <strong class="text-danger small d-block mb-2">Missing Keywords:</strong>
                                    <div class="d-flex flex-wrap gap-1" v-if="missingSkills.length > 0">
                                        <span class="badge bg-danger-subtle text-danger px-2 py-1 rounded-pill small fw-normal" v-for="skill in missingSkills">{{ skill }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="border-top pt-3">
                                <strong class="text-dark small d-block mb-2">Suggestions:</strong>
                                <ul class="small text-secondary ps-3 mb-0">
                                    <li class="mb-1" v-for="sug in suggestions">{{ sug }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};

const CompanyDashboard = {
    name: 'CompanyDashboard',
    data() {
        return {
            dashboard: {
                company: '',
                total_drives: 0,
                total_applications: 0,
                pending_drives: 0
            },
            loading: true
        };
    },
    async mounted() {
        try {
            const data = await apiFetch('/api/company/dashboard');
            this.dashboard = data;
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-building-fill text-primary fs-3"></i>
                <span>Recruiter Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/company/dashboard" class="sidebar-nav-link active">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/create-drive" class="sidebar-nav-link">
                        <i class="bi bi-plus-circle"></i> Create Drive
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/my-drives" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-text"></i> My Drives
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Recruiter Dashboard</h2>
                <p class="text-muted" v-if="dashboard.company">Company: <span class="fw-semibold text-primary">{{ dashboard.company }}</span></p>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading placement drives stats...</p>
            </div>

            <div v-else class="fade-in">
                <div class="row g-4 mb-5">
                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-briefcase fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Total Drives</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.total_drives }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-info text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-people fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Total Applicants</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.total_applications }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-warning text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-hourglass-split fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.8rem; letter-spacing: 0.5px;">Pending Approval</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.pending_drives }}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="bi bi-shield-check text-primary me-2"></i>Recruiter Rules & Flow</h5>
                    <ul class="text-secondary ps-3 mb-0">
                        <li class="mb-2">Before setting up placement drives, your profile must be reviewed and <strong>Approved</strong> by the institute admin.</li>
                        <li class="mb-2">Once approved, you can create new placement drives. Admin will check eligibility parameters before approving.</li>
                        <li class="mb-2">Under <strong>My Drives</strong>, select any drive to view student registrations, shortlist/reject students, and schedule interviews.</li>
                    </ul>
                </div>
            </div>
        </main>
    </div>
    `
};

const CompanyCreateDrive = {
    name: 'CompanyCreateDrive',
    data() {
        return {
            form: {
                job_title: '',
                job_description: '',
                branch: '',
                min_cgpa: '',
                graduation_year: '',
                package: '',
                location: '',
                deadline: ''
            },
            loading: false,
            alertMsg: '',
            alertType: 'success'
        };
    },
    methods: {
        async handleSubmit() {
            this.loading = true;
            this.alertMsg = '';
            try {
                const data = await apiFetch('/api/company/create-drive', {
                    method: 'POST',
                    body: {
                        job_title: this.form.job_title,
                        job_description: this.form.job_description,
                        branch: this.form.branch,
                        min_cgpa: parseFloat(this.form.min_cgpa),
                        graduation_year: parseInt(this.form.graduation_year),
                        package: parseFloat(this.form.package),
                        location: this.form.location,
                        deadline: this.form.deadline
                    }
                });

                this.alertMsg = data.message || 'Placement drive submitted successfully!';
                this.alertType = 'success';

                this.form = {
                    job_title: '',
                    job_description: '',
                    branch: '',
                    min_cgpa: '',
                    graduation_year: '',
                    package: '',
                    location: '',
                    deadline: ''
                };

                setTimeout(() => {
                    this.$router.push('/company/my-drives');
                }, 2000);

            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to submit placement drive.';
                this.alertType = 'danger';
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-building-fill text-primary fs-3"></i>
                <span>Recruiter Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/company/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/create-drive" class="sidebar-nav-link active">
                        <i class="bi bi-plus-circle"></i> Create Drive
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/my-drives" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-text"></i> My Drives
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Create Placement Drive</h2>
                <p class="text-muted">Register a new recruitment event (Requires admin validation)</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div class="card border-0 bg-white shadow-sm rounded-4 p-4 fade-in" style="max-width: 800px;">
                <form @submit.prevent="handleSubmit">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Job Title</label>
                            <input type="text" class="form-control" placeholder="Software Engineer Intern" v-model="form.job_title" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Eligible Academic Branch</label>
                            <input type="text" class="form-control" placeholder="Computer Science" v-model="form.branch" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Minimum CGPA Requirement</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" placeholder="7.5" v-model="form.min_cgpa" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Eligible Graduation Year</label>
                            <input type="number" class="form-control" placeholder="2026" v-model="form.graduation_year" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Package offered (LPA)</label>
                            <input type="number" step="0.1" class="form-control" placeholder="12.0" v-model="form.package" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Job Location</label>
                            <input type="text" class="form-control" placeholder="Bangalore / Remote" v-model="form.location" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-secondary small fw-semibold">Job Description</label>
                            <textarea class="form-control" rows="4" placeholder="Detail work responsibilities..." v-model="form.job_description" required></textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Application Deadline Date</label>
                            <input type="date" class="form-control" v-model="form.deadline" required>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 border-top pt-3">
                        <button type="submit" class="btn btn-primary px-4 text-white rounded-pill fw-semibold shadow-sm" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Create Drive
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
    `
};

const CompanyMyDrives = {
    name: 'CompanyMyDrives',
    data() {
        return {
            drives: [],
            loading: true
        };
    },
    mounted() {
        this.loadDrives();
    },
    methods: {
        async loadDrives() {
            try {
                const data = await apiFetch('/api/company/my-drives');
                this.drives = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-building-fill text-primary fs-3"></i>
                <span>Recruiter Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/company/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/create-drive" class="sidebar-nav-link">
                        <i class="bi bi-plus-circle"></i> Create Drive
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/my-drives" class="sidebar-nav-link active">
                        <i class="bi bi-file-earmark-text"></i> My Drives
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">My Drives</h2>
                    <p class="text-muted">Manage your registered recruitment drives</p>
                </div>
                <router-link to="/company/create-drive" class="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold rounded-3 shadow-sm">
                    <i class="bi bi-plus"></i> Create Drive
                </router-link>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading your drives...</p>
            </div>

            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-folder2-open text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Placement Drives Created</h5>
                <p class="text-secondary mb-3">You have not created any recruitment drives yet.</p>
                <router-link to="/company/create-drive" class="btn btn-primary px-4 text-white fw-semibold rounded-3 shadow-sm">Create New Drive</router-link>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Eligible Branch</th>
                            <th class="py-3">Package</th>
                            <th class="py-3">Location</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="drive in drives" :key="drive.id">
                            <td>
                                <span class="fw-semibold text-dark">{{ drive.job_title }}</span>
                            </td>
                            <td>{{ drive.branch }}</td>
                            <td>{{ drive.package }} LPA</td>
                            <td>{{ drive.location }}</td>
                            <td class="text-center">
                                <span class="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                                    :class="{
                                        'bg-primary-subtle text-primary': drive.status === 'Approved',
                                        'bg-warning-subtle text-warning': drive.status === 'Pending',
                                        'bg-danger-subtle text-danger': drive.status === 'Rejected',
                                        'bg-secondary-subtle text-secondary': drive.status === 'Closed'
                                    }">
                                    {{ drive.status }}
                                </span>
                            </td>
                            <td class="text-end">
                                <router-link :to="'/company/applications/' + drive.id" class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold" :disabled="drive.status !== 'Approved'">
                                    <i class="bi bi-people me-1"></i> View Applicants
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const CompanyApplicants = {
    name: 'CompanyApplicants',
    data() {
        return {
            students: [],
            loading: true,
            interviewForms: {},
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadApplicants();
    },
    methods: {
        async loadApplicants() {
            const driveId = this.$route.params.driveId;
            try {
                const data = await apiFetch(`/api/company/drive/${driveId}/applications`);
                this.students = data;

                data.forEach(student => {
                    if (!this.interviewForms[student.application_id]) {
                        this.interviewForms[student.application_id] = {
                            interview_date: '',
                            interview_mode: 'Online',
                            interview_link: '',
                            showForm: false
                        };
                    }
                });
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleStatus(appId, status) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/company/application/${appId}/status`, {
                    method: 'PUT',
                    body: { status }
                });
                this.alertMsg = data.message || `Status updated to ${status}.`;
                this.alertType = 'success';
                this.loadApplicants();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to update status.';
                this.alertType = 'danger';
            }
        },
        async handleSchedule(appId) {
            this.alertMsg = '';
            const formData = this.interviewForms[appId];
            if (!formData.interview_date || !formData.interview_mode) {
                alert('Please provide interview date and mode.');
                return;
            }
            try {
                const data = await apiFetch(`/api/company/application/${appId}/schedule-interview`, {
                    method: 'PUT',
                    body: {
                        interview_date: formData.interview_date,
                        interview_mode: formData.interview_mode,
                        interview_link: formData.interview_link
                    }
                });
                this.alertMsg = data.message || 'Interview scheduled successfully!';
                this.alertType = 'success';
                formData.showForm = false;
                this.loadApplicants();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to schedule interview.';
                this.alertType = 'danger';
            }
        },
        downloadOfferLetter(appId) {
            window.open(`/api/company/application/${appId}/offer-letter`, '_blank');
        },
        viewResume(resumeUrl) {
            if (resumeUrl) {
                window.open(resumeUrl, '_blank');
            } else {
                alert('This student has not uploaded a resume.');
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-building-fill text-primary fs-3"></i>
                <span>Recruiter Portal</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/company/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/create-drive" class="sidebar-nav-link">
                        <i class="bi bi-plus-circle"></i> Create Drive
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/my-drives" class="sidebar-nav-link active">
                        <i class="bi bi-file-earmark-text"></i> My Drives
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Student Applicants</h2>
                    <p class="text-muted">Review, filter, and schedule placement interactions</p>
                </div>
                <router-link to="/company/my-drives" class="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-arrow-left me-1"></i> Back to Drives
                </router-link>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading student applicants...</p>
            </div>

            <div v-else-if="students.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Applicants Yet</h5>
                <p class="text-secondary mb-0">No students have applied to this drive.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Name</th>
                            <th class="py-3">Branch</th>
                            <th class="py-3">CGPA</th>
                            <th class="py-3">Graduation</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="student in students" :key="student.application_id">
                            <tr>
                                <td><span class="fw-semibold text-dark">{{ student.student_name }}</span></td>
                                <td>{{ student.branch }}</td>
                                <td><span class="badge bg-light text-dark border">{{ student.cgpa }}</span></td>
                                <td>{{ student.graduation_year }}</td>
                                <td class="text-center">
                                    <span class="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                                        :class="{
                                            'bg-primary-subtle text-primary': student.status === 'Applied',
                                            'bg-warning-subtle text-warning': student.status === 'Shortlisted',
                                            'bg-success-subtle text-success': student.status === 'Selected',
                                            'bg-danger-subtle text-danger': student.status === 'Rejected'
                                        }">
                                        {{ student.status }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex justify-content-center gap-2">
                                        <button @click="viewResume(student.resume)" class="btn btn-sm btn-outline-secondary px-2 rounded-pill fw-semibold">
                                            <i class="bi bi-file-earmark-pdf"></i> Resume
                                        </button>
                                        <button v-if="student.status === 'Applied'" @click="handleStatus(student.application_id, 'Shortlisted')" class="btn btn-sm btn-warning px-2 text-white fw-semibold rounded-pill">
                                            Shortlist
                                        </button>
                                        <button v-if="student.status === 'Shortlisted'" @click="interviewForms[student.application_id].showForm = !interviewForms[student.application_id].showForm" class="btn btn-sm btn-outline-warning px-2 fw-semibold rounded-pill">
                                            <i class="bi bi-calendar-plus"></i> Interview
                                        </button>
                                        <button v-if="['Applied', 'Shortlisted'].includes(student.status)" @click="handleStatus(student.application_id, 'Selected')" class="btn btn-sm btn-success px-2 text-white fw-semibold rounded-pill">
                                            Select
                                        </button>
                                        <button v-if="['Applied', 'Shortlisted'].includes(student.status)" @click="handleStatus(student.application_id, 'Rejected')" class="btn btn-sm btn-danger px-2 text-white fw-semibold rounded-pill">
                                            Reject
                                        </button>
                                        <button v-if="student.status === 'Selected'" @click="downloadOfferLetter(student.application_id)" class="btn btn-sm btn-outline-success px-3 rounded-pill fw-semibold">
                                            <i class="bi bi-download"></i> Offer Letter
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            
                            <tr v-if="interviewForms[student.application_id].showForm">
                                <td colspan="6" class="bg-light p-3 border-top">
                                    <div class="card border-0 shadow-sm p-3 rounded-3" style="max-width: 700px; margin: 0 auto;">
                                        <h6 class="fw-bold text-dark mb-3">Schedule Recruitment Interview</h6>
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Date & Time</label>
                                                <input type="datetime-local" class="form-control form-control-sm" v-model="interviewForms[student.application_id].interview_date">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Mode</label>
                                                <select class="form-select form-select-sm" v-model="interviewForms[student.application_id].interview_mode">
                                                    <option value="Online">Online Link</option>
                                                    <option value="Offline">In-Person Office</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Link or Venue</label>
                                                <input type="text" class="form-control form-control-sm" placeholder="Zoom Link / Conference Room" v-model="interviewForms[student.application_id].interview_link">
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-end gap-2 mt-3">
                                            <button type="button" @click="interviewForms[student.application_id].showForm = false" class="btn btn-sm btn-outline-secondary px-3 rounded-pill">Cancel</button>
                                            <button type="button" @click="handleSchedule(student.application_id)" class="btn btn-sm btn-warning text-white px-3 rounded-pill fw-semibold">Schedule Now</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminDashboard = {
    name: 'AdminDashboard',
    data() {
        return {
            dashboard: {
                students: 0,
                companies: 0,
                pending_companies: 0,
                pending_drives: 0
            },
            loading: true
        };
    },
    async mounted() {
        try {
            const data = await apiFetch('/api/admin/dashboard');
            this.dashboard = data;
        } catch (error) {
            console.error(error);
        } finally {
            this.loading = false;
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link active">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Admin Dashboard</h2>
                <p class="text-muted">Welcome, Institutional Administrator 👋</p>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading system overview...</p>
            </div>

            <div v-else class="fade-in">
                <div class="row g-4 mb-5">
                    <div class="col-md-3">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-people fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Students</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.students }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="stat-card d-flex align-items-center gap-3">
                            <div class="bg-success text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-building fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">Companies</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.companies }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="stat-card d-flex align-items-center gap-3 bg-warning-subtle border-warning-subtle">
                            <div class="bg-warning text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-building-exclamation fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">New Companies</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.pending_companies }}</h3>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <div class="stat-card d-flex align-items-center gap-3 bg-danger-subtle border-danger-subtle">
                            <div class="bg-danger text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 55px; height: 55px;">
                                <i class="bi bi-briefcase fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">New Drives</h6>
                                <h3 class="fw-bold mb-0 text-dark">{{ dashboard.pending_drives }}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    <div class="col-md-6" v-if="dashboard.pending_companies > 0">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-2">Action Needed: Companies</h5>
                            <p class="text-secondary small">There are <strong>{{ dashboard.pending_companies }}</strong> companies awaiting verification.</p>
                            <router-link to="/admin/pending-companies" class="btn btn-primary btn-sm text-white px-3 py-2 fw-semibold rounded-pill mt-2">Approve Companies</router-link>
                        </div>
                    </div>

                    <div class="col-md-6" v-if="dashboard.pending_drives > 0">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-2">Action Needed: Job Drives</h5>
                            <p class="text-secondary small">There are <strong>{{ dashboard.pending_drives }}</strong> job drives submitted by recruiters.</p>
                            <router-link to="/admin/pending-drives" class="btn btn-primary btn-sm text-white px-3 py-2 fw-semibold rounded-pill mt-2">Approve Drives</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};

const AdminPendingCompanies = {
    name: 'AdminPendingCompanies',
    data() {
        return {
            companies: [],
            loading: true,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadPending();
    },
    methods: {
        async loadPending() {
            try {
                const data = await apiFetch('/api/admin/companies/pending');
                this.companies = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleApprove(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/company/${id}/approve`, { method: 'PUT' });
                this.alertMsg = data.message || 'Company approved successfully!';
                this.alertType = 'success';
                this.loadPending();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to approve.';
                this.alertType = 'danger';
            }
        },
        async handleReject(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/company/${id}/reject`, { method: 'PUT' });
                this.alertMsg = data.message || 'Company registration rejected.';
                this.alertType = 'warning';
                this.loadPending();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to reject.';
                this.alertType = 'danger';
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link active">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Pending Recruiter Approvals</h2>
                    <p class="text-muted">Review and verify new company registrations</p>
                </div>
                <router-link to="/admin/approved-companies" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-shield-check me-1"></i> Approved Companies
                </router-link>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading registrations...</p>
            </div>

            <div v-else-if="companies.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-patch-check text-success fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Pending Recruiter Requests</h5>
                <p class="text-secondary mb-0">All corporate registrations have been verified.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Company Name</th>
                            <th class="py-3">HR Email Address</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="company in companies" :key="company.id">
                            <td><span class="fw-semibold text-dark">{{ company.company_name }}</span></td>
                            <td>{{ company.hr_email }}</td>
                            <td class="text-center">
                                <span class="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-semibold">{{ company.status }}</span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button @click="handleApprove(company.id)" class="btn btn-sm btn-success text-white px-3 rounded-pill fw-semibold">
                                        Approve
                                    </button>
                                    <button @click="handleReject(company.id)" class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold">
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminApprovedCompanies = {
    name: 'AdminApprovedCompanies',
    data() {
        return {
            companies: [],
            loading: true
        };
    },
    mounted() {
        this.loadApproved();
    },
    methods: {
        async loadApproved() {
            try {
                const data = await apiFetch('/api/admin/companies/approved');
                this.companies = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link active">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Approved Companies</h2>
                    <p class="text-muted">Verified recruiters with system access</p>
                </div>
                <router-link to="/admin/pending-companies" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-clock me-1"></i> Pending Companies
                </router-link>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading approved recruiters...</p>
            </div>

            <div v-else-if="companies.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-building text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Approved Companies Yet</h5>
                <p class="text-secondary mb-0">No recruiters are registered as approved yet.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Company Name</th>
                            <th class="py-3">HR Email Address</th>
                            <th class="py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="company in companies" :key="company.id">
                            <td><span class="fw-semibold text-dark">{{ company.company_name }}</span></td>
                            <td>{{ company.hr_email }}</td>
                            <td class="text-center">
                                <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">{{ company.status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminPendingDrives = {
    name: 'AdminPendingDrives',
    data() {
        return {
            drives: [],
            loading: true,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.loadPendingDrives();
    },
    methods: {
        async loadPendingDrives() {
            try {
                const data = await apiFetch('/api/admin/drives/pending');
                this.drives = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async handleApprove(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/drive/${id}/approve`, { method: 'PUT' });
                this.alertMsg = data.message || 'Drive approved and published!';
                this.alertType = 'success';
                this.loadPendingDrives();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to approve.';
                this.alertType = 'danger';
            }
        },
        async handleReject(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/drive/${id}/reject`, { method: 'PUT' });
                this.alertMsg = data.message || 'Drive registration rejected.';
                this.alertType = 'warning';
                this.loadPendingDrives();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to reject.';
                this.alertType = 'danger';
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link active">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Pending Drive Approvals</h2>
                    <p class="text-muted">Authorize submitted placement recruitment events</p>
                </div>
                <router-link to="/admin/approved-drives" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-briefcase me-1"></i> Approved Drives
                </router-link>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading submitted job drives...</p>
            </div>

            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-calendar-check text-success fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Pending Drives</h5>
                <p class="text-secondary mb-0">No recruitment drives are currently pending review.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Target Branch</th>
                            <th class="py-3">Min CGPA</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="drive in drives" :key="drive.id">
                            <td><span class="fw-semibold text-dark">{{ drive.job_title }}</span></td>
                            <td>{{ drive.branch }}</td>
                            <td><span class="badge bg-light text-dark border">{{ drive.min_cgpa }}</span></td>
                            <td class="text-center">
                                <span class="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-semibold">{{ drive.status }}</span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button @click="handleApprove(drive.id)" class="btn btn-sm btn-success text-white px-3 rounded-pill fw-semibold">
                                        Approve
                                    </button>
                                    <button @click="handleReject(drive.id)" class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold">
                                        Reject
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminApprovedDrives = {
    name: 'AdminApprovedDrives',
    data() {
        return {
            drives: [],
            loading: true
        };
    },
    mounted() {
        this.loadApprovedDrives();
    },
    methods: {
        async loadApprovedDrives() {
            try {
                const data = await apiFetch('/api/admin/drives/approved');
                this.drives = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link active">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Approved Placement Drives</h2>
                    <p class="text-muted">Active recruitment drives currently open to students</p>
                </div>
                <router-link to="/admin/pending-drives" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-clock me-1"></i> Pending Drives
                </router-link>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading approved job drives...</p>
            </div>

            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-briefcase text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Active Drives</h5>
                <p class="text-secondary mb-0">There are no approved drives published.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Target Branch</th>
                            <th class="py-3">Min CGPA</th>
                            <th class="py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="drive in drives" :key="drive.id">
                            <td><span class="fw-semibold text-dark">{{ drive.job_title }}</span></td>
                            <td>{{ drive.branch }}</td>
                            <td><span class="badge bg-light text-dark border">{{ drive.min_cgpa }}</span></td>
                            <td class="text-center">
                                <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">{{ drive.status }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminApplications = {
    name: 'AdminApplications',
    data() {
        return {
            applications: [],
            loading: true
        };
    },
    mounted() {
        this.loadAllApplications();
    },
    methods: {
        async loadAllApplications() {
            try {
                const data = await apiFetch('/api/admin/applications');
                this.applications = data;
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link active">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Student Applications</h2>
                    <p class="text-muted">Consolidated database of all recruitment registrations</p>
                </div>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading registration history...</p>
            </div>

            <div v-else-if="applications.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-file-earmark-x text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Registration Actions Recorded</h5>
                <p class="text-secondary mb-0">Students have not applied to any recruitment drives yet.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Application ID</th>
                            <th class="py-3">Student Name</th>
                            <th class="py-3">Company</th>
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Applied On</th>
                            <th class="py-3 text-center">Recruitment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in applications" :key="app.application_id">
                            <td><span class="text-secondary fw-semibold">#{{ app.application_id }}</span></td>
                            <td class="fw-semibold text-dark">{{ app.student_name }}</td>
                            <td>{{ app.company }}</td>
                            <td>{{ app.job_title }}</td>
                            <td class="text-secondary small">{{ app.applied_on ? app.applied_on.split(' ')[0] : 'N/A' }}</td>
                            <td class="text-center">
                                <span class="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                                    :class="{
                                        'bg-primary-subtle text-primary': app.status === 'Applied',
                                        'bg-warning-subtle text-warning': app.status === 'Shortlisted',
                                        'bg-success-subtle text-success': app.status === 'Selected',
                                        'bg-danger-subtle text-danger': app.status === 'Rejected'
                                    }">
                                    {{ app.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminAnalytics = {
    name: 'AdminAnalytics',
    data() {
        return {
            analytics: {
                total_students: 0,
                total_companies: 0,
                total_drives: 0,
                approved_companies: 0,
                approved_drives: 0,
                total_applications: 0,
                selected_students: 0
            },
            loading: true
        };
    },
    mounted() {
        this.loadAnalytics();
    },
    methods: {
        async loadAnalytics() {
            try {
                const data = await apiFetch('/api/admin/analytics');
                this.analytics = data;
                
                await this.$nextTick();
                this.renderCharts();
            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        renderCharts() {
            const ctx1 = document.getElementById('pipelineChart');
            if (ctx1) {
                const selected = this.analytics.selected_students;
                const total = this.analytics.total_applications;
                const active = Math.max(0, total - selected);

                new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: ['Selected Candidates', 'Applied/In-Progress'],
                        datasets: [{
                            data: [selected, active],
                            backgroundColor: ['#10b981', '#6366f1'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }

            const ctx2 = document.getElementById('metricsChart');
            if (ctx2) {
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['Students', 'Recruiters', 'Job Drives', 'Applications'],
                        datasets: [{
                            label: 'Platform Totals',
                            data: [
                                this.analytics.total_students,
                                this.analytics.total_companies,
                                this.analytics.total_drives,
                                this.analytics.total_applications
                            ],
                            backgroundColor: '#4f46e5',
                            borderRadius: 6
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        },
                        plugins: {
                            legend: { display: false }
                        }
                    }
                });
            }
        },
        downloadPDFReport() {
            window.open('/api/admin/report/pdf', '_blank');
        },
        viewHTMLReport() {
            window.open('/api/admin/report/html', '_blank');
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link active">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Placement Analytics</h2>
                    <p class="text-muted">Performance summaries and monthly placement reports</p>
                </div>
                <div class="d-flex gap-2">
                    <button @click="viewHTMLReport" class="btn btn-outline-primary fw-semibold rounded-3 shadow-sm d-flex align-items-center gap-1">
                        <i class="bi bi-eye"></i> View HTML Report
                    </button>
                    <button @click="downloadPDFReport" class="btn btn-primary text-white fw-semibold rounded-3 shadow-sm d-flex align-items-center gap-1">
                        <i class="bi bi-file-earmark-pdf"></i> Download PDF Report
                    </button>
                </div>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading activity metrics...</p>
            </div>

            <div v-else class="fade-in">
                <div class="row g-4 mb-4">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem;">Total Applications</h6>
                            <h3 class="fw-bold mb-0 text-dark">{{ analytics.total_applications }}</h3>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem;">Selected Candidates</h6>
                            <h3 class="fw-bold mb-0 text-success">{{ analytics.selected_students }}</h3>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem;">Approved Recruiters</h6>
                            <h3 class="fw-bold mb-0 text-info">{{ analytics.approved_companies }}</h3>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h6 class="text-muted mb-1 text-uppercase fw-semibold" style="font-size: 0.75rem;">Approved Job Drives</h6>
                            <h3 class="fw-bold mb-0 text-primary">{{ analytics.approved_drives }}</h3>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mb-4">
                    <div class="col-lg-5">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-3">Placement Success Rate</h5>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pipelineChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-3">Platform Performance</h5>
                            <div style="height: 300px; position: relative;">
                                <canvas id="metricsChart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};

const AdminSearchStudents = {
    name: 'AdminSearchStudents',
    data() {
        return {
            students: [],
            keyword: '',
            loading: false,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.search();
    },
    methods: {
        async search() {
            this.loading = true;
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/search/students?keyword=${encodeURIComponent(this.keyword)}`);
                this.students = data;
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to search students.';
                this.alertType = 'danger';
            } finally {
                this.loading = false;
            }
        },
        async handleDeactivate(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/student/${id}/deactivate`, { method: 'PUT' });
                this.alertMsg = data.message || 'Student deactivated successfully!';
                this.alertType = 'warning';
                this.search();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to deactivate.';
                this.alertType = 'danger';
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link active">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Search Students</h2>
                <p class="text-muted">Manage academic profiles and deactivate candidates</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div class="mb-4">
                <div class="input-group" style="max-width: 500px;">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Type student name..." v-model="keyword" @keyup.enter="search">
                    <button class="btn btn-primary" type="button" @click="search">Search</button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Searching database...</p>
            </div>

            <div v-else-if="students.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-person-x text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Students Found</h5>
                <p class="text-secondary mb-0">Try alternative search keywords.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Name</th>
                            <th class="py-3">Branch</th>
                            <th class="py-3">CGPA</th>
                            <th class="py-3">Graduation Year</th>
                            <th class="py-3">Placement Status</th>
                            <th class="py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="student in students" :key="student.id">
                            <td><span class="fw-semibold text-dark">{{ student.name }}</span></td>
                            <td>{{ student.branch }}</td>
                            <td><span class="badge bg-light text-dark border">{{ student.cgpa }}</span></td>
                            <td>{{ student.graduation_year }}</td>
                            <td>
                                <span class="badge rounded-pill fw-semibold"
                                    :class="student.placement_status === 'Placed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'">
                                    {{ student.placement_status }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button @click="handleDeactivate(student.id)" class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold">
                                    Deactivate
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

const AdminSearchCompanies = {
    name: 'AdminSearchCompanies',
    data() {
        return {
            companies: [],
            keyword: '',
            loading: false,
            alertMsg: '',
            alertType: 'success'
        };
    },
    mounted() {
        this.search();
    },
    methods: {
        async search() {
            this.loading = true;
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/search/companies?keyword=${encodeURIComponent(this.keyword)}`);
                this.companies = data;
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to search companies.';
                this.alertType = 'danger';
            } finally {
                this.loading = false;
            }
        },
        async handleBlacklist(id) {
            this.alertMsg = '';
            try {
                const data = await apiFetch(`/api/admin/company/${id}/blacklist`, { method: 'PUT' });
                this.alertMsg = data.message || 'Company blacklisted successfully!';
                this.alertType = 'danger';
                this.search();
            } catch (error) {
                console.error(error);
                this.alertMsg = error.message || 'Failed to blacklist company.';
                this.alertType = 'danger';
            }
        }
    },
    template: `
    <div class="dashboard-layout">
        <aside class="sidebar">
            <div class="sidebar-brand">
                <i class="bi bi-shield-lock-fill text-primary fs-3"></i>
                <span>Admin Panel</span>
            </div>
            <ul class="sidebar-nav">
                <li>
                    <router-link to="/admin/dashboard" class="sidebar-nav-link">
                        <i class="bi bi-speedometer2"></i> Dashboard
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-companies" class="sidebar-nav-link">
                        <i class="bi bi-building-exclamation"></i> Pending Companies
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/pending-drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase-fill"></i> Pending Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/analytics" class="sidebar-nav-link">
                        <i class="bi bi-bar-chart-line"></i> Analytics
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-students" class="sidebar-nav-link">
                        <i class="bi bi-people"></i> Search Students
                    </router-link>
                </li>
                <li>
                    <router-link to="/admin/search-companies" class="sidebar-nav-link active">
                        <i class="bi bi-building"></i> Search Companies
                    </router-link>
                </li>
            </ul>
            <div class="sidebar-footer">
                <button @click="$root.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <main class="main-content">
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Search Companies</h2>
                <p class="text-muted">Manage corporate recruiter accounts and blacklist portals</p>
            </header>

            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div class="mb-4">
                <div class="input-group" style="max-width: 500px;">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Type company name..." v-model="keyword" @keyup.enter="search">
                    <button class="btn btn-primary" type="button" @click="search">Search</button>
                </div>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Searching database...</p>
            </div>

            <div v-else-if="companies.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-building-exclamation text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Companies Found</h5>
                <p class="text-secondary mb-0">Try typing a different name keyword.</p>
            </div>

            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Company Name</th>
                            <th class="py-3">Website</th>
                            <th class="py-3 text-center">Approval Status</th>
                            <th class="py-3 text-center">Blacklisted</th>
                            <th class="py-3 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="company in companies" :key="company.id">
                            <td><span class="fw-semibold text-dark">{{ company.company_name }}</span></td>
                            <td><a :href="company.website" target="_blank" class="text-decoration-none">{{ company.website }}</a></td>
                            <td class="text-center">
                                <span class="badge rounded-pill fw-semibold text-uppercase"
                                    :class="{
                                        'bg-success-subtle text-success': company.approval_status === 'Approved',
                                        'bg-warning-subtle text-warning': company.approval_status === 'Pending',
                                        'bg-danger-subtle text-danger': company.approval_status === 'Rejected'
                                    }">
                                    {{ company.approval_status }}
                                </span>
                            </td>
                            <td class="text-center">
                                <span class="badge px-3 py-2 rounded-pill fw-semibold"
                                    :class="company.blacklisted ? 'bg-danger-subtle text-danger' : 'bg-light text-secondary border'">
                                    {{ company.blacklisted ? 'Yes' : 'No' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <button @click="handleBlacklist(company.id)" class="btn btn-sm btn-danger text-white px-3 rounded-pill fw-semibold" :disabled="company.blacklisted">
                                    Blacklist
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};

// ----------------------------------------------------
// Router Configurations
// ----------------------------------------------------

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

// ----------------------------------------------------
// Vue App Init
// ----------------------------------------------------

const App = {
    data() {
        return {
            token: localStorage.getItem('token') || '',
            role: localStorage.getItem('role') || ''
        };
    },
    methods: {
        login(newToken, newRole) {
            this.token = newToken;
            this.role = newRole;
            localStorage.setItem('token', newToken);
            localStorage.setItem('role', newRole);
        },
        logout() {
            this.token = '';
            this.role = '';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            this.$router.push('/');
        }
    },
    template: `<router-view></router-view>`
};

const app = createApp(App);
app.use(router);
app.mount('#app');
