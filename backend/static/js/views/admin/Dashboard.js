const { ref, onMounted, inject } = Vue;

export default {
    name: 'AdminDashboard',
    setup() {
        const auth = inject('auth');
        const dashboard = ref({
            students: 0,
            companies: 0,
            drives: 0,
            pending_companies: 0,
            pending_drives: 0
        });
        const loading = ref(true);

        onMounted(async () => {
            try {
                const response = await axios.get('/api/admin/dashboard');
                dashboard.value = response.data;
            } catch (error) {
                console.error('Error loading admin dashboard stats:', error);
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
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
                <!-- Stats Section -->
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

                <!-- Admin Tasks Card -->
                <div class="row g-4">
                    <div class="col-md-6" v-if="dashboard.pending_companies > 0">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-2"><i class="bi bi-exclamation-circle text-warning me-2"></i>Action Needed: Companies</h5>
                            <p class="text-secondary small">There are <strong>{{ dashboard.pending_companies }}</strong> companies awaiting verification. Review registration details and approve or reject them to authorize job drive creation.</p>
                            <router-link to="/admin/pending-companies" class="btn btn-primary btn-sm text-white px-3 py-2 fw-semibold rounded-pill mt-2">Approve Companies</router-link>
                        </div>
                    </div>

                    <div class="col-md-6" v-if="dashboard.pending_drives > 0">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-2"><i class="bi bi-exclamation-circle text-danger me-2"></i>Action Needed: Job Drives</h5>
                            <p class="text-secondary small">There are <strong>{{ dashboard.pending_drives }}</strong> job drives submitted by recruiters. Verify eligibility specifications (CGPA requirements and deadlines) and approve them.</p>
                            <router-link to="/admin/pending-drives" class="btn btn-primary btn-sm text-white px-3 py-2 fw-semibold rounded-pill mt-2">Approve Drives</router-link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};
