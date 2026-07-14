const { ref, onMounted, inject, nextTick } = Vue;

export default {
    name: 'AdminAnalytics',
    setup() {
        const auth = inject('auth');
        const analytics = ref({
            total_students: 0,
            total_companies: 0,
            total_drives: 0,
            approved_companies: 0,
            approved_drives: 0,
            total_applications: 0,
            selected_students: 0
        });
        const loading = ref(true);

        const loadAnalytics = async () => {
            try {
                const response = await axios.get('/api/admin/analytics');
                analytics.value = response.data;

                // Wait for DOM to load canvas nodes
                await nextTick();
                renderCharts();
            } catch (error) {
                console.error('Error loading analytics:', error);
            } finally {
                loading.value = false;
            }
        };

        const renderCharts = () => {
            // Chart 1: Selection Pipeline
            const ctx1 = document.getElementById('pipelineChart');
            if (ctx1) {
                const selected = analytics.value.selected_students;
                const totalApps = analytics.value.total_applications;
                const nonSelected = Math.max(0, totalApps - selected);

                new Chart(ctx1, {
                    type: 'doughnut',
                    data: {
                        labels: ['Selected Candidates', 'Applied/In-Progress'],
                        datasets: [{
                            data: [selected, nonSelected],
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

            // Chart 2: Key Metrics Comparison
            const ctx2 = document.getElementById('metricsChart');
            if (ctx2) {
                new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['Students', 'Recruiters', 'Job Drives', 'Applications'],
                        datasets: [{
                            label: 'Platform Totals',
                            data: [
                                analytics.value.total_students,
                                analytics.value.total_companies,
                                analytics.value.total_drives,
                                analytics.value.total_applications
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
        };

        const downloadPDFReport = () => {
            window.open('/api/admin/report/pdf', '_blank');
        };

        const viewHTMLReport = () => {
            window.open('/api/admin/report/html', '_blank');
        };

        onMounted(() => {
            loadAnalytics();
        });

        return {
            auth,
            analytics,
            loading,
            downloadPDFReport,
            viewHTMLReport
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
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
                <!-- Metrics Stats cards -->
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

                <!-- Graphical Analytics Charts -->
                <div class="row g-4 mb-4">
                    <div class="col-lg-5">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-3"><i class="bi bi-pie-chart text-success me-1"></i>Placement Success Rate</h5>
                            <div style="height: 300px; position: relative;">
                                <canvas id="pipelineChart"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-7">
                        <div class="card border-0 bg-white shadow-sm p-4 rounded-4">
                            <h5 class="fw-bold text-dark mb-3"><i class="bi bi-bar-chart text-primary me-1"></i>Platform Performance</h5>
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
