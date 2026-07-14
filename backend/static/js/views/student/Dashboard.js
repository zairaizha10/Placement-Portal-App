const { ref, onMounted, inject } = Vue;

export default {
    name: 'StudentDashboard',
    setup() {
        const auth = inject('auth');
        const profile = ref(null);
        const totalApplications = ref(0);
        const availableDrives = ref(0);
        const loading = ref(true);

        onMounted(async () => {
            try {
                const [profileRes, appsRes, drivesRes] = await Promise.all([
                    axios.get('/api/student/profile'),
                    axios.get('/api/student/applications'),
                    axios.get('/api/student/drives')
                ]);

                profile.value = profileRes.data;
                totalApplications.value = appsRes.data.length;
                availableDrives.value = drivesRes.data.length;
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                loading.value = false;
            }
        });

        return {
            auth,
            profile,
            totalApplications,
            availableDrives,
            loading
        };
    },
    template: `
    <div class="dashboard-layout">
        <!-- Sidebar -->
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
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
                <!-- Stats Section -->
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

                <!-- Info Banner -->
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
