const { ref, onMounted, inject } = Vue;

export default {
    name: 'CompanyDashboard',
    setup() {
        const auth = inject('auth');
        const dashboard = ref({
            company: '',
            total_drives: 0,
            total_applications: 0,
            pending_drives: 0
        });
        const loading = ref(true);

        onMounted(async () => {
            try {
                const response = await axios.get('/api/company/dashboard');
                dashboard.value = response.data;
            } catch (error) {
                console.error('Error loading company dashboard:', error);
            } finally {
                loading.value = false;
            }
        });

        return {
            auth,
            dashboard,
            loading
        };
    },
    template: `
    <div class="dashboard-layout">
        <!-- Sidebar -->
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Recruiter Dashboard</h2>
                    <p class="text-muted" v-if="dashboard.company">Company: <span class="fw-semibold text-primary">{{ dashboard.company }}</span></p>
                </div>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading placement drives stats...</p>
            </div>

            <div v-else class="fade-in">
                <!-- Stats Section -->
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

                <!-- Recruiter Guideline -->
                <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                    <h5 class="fw-bold text-dark mb-3"><i class="bi bi-shield-check text-primary me-2"></i>Recruiter Rules & Flow</h5>
                    <ul class="text-secondary ps-3 mb-0">
                        <li class="mb-2">Before setting up placement drives, your profile must be reviewed and <strong>Approved</strong> by the institute admin.</li>
                        <li class="mb-2">Once approved, you can create new placement drives. Admin will check eligibility parameters (CGPA, branch eligibility) before approving the drive.</li>
                        <li class="mb-2">Under <strong>My Drives</strong>, select any drive to view student registrations, shortlist/reject students, schedule online/offline interviews, and mark final selection lists.</li>
                    </ul>
                </div>
            </div>
        </main>
    </div>
    `
};
