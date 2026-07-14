const { ref, onMounted, inject } = Vue;

export default {
    name: 'AdminApplications',
    setup() {
        const auth = inject('auth');
        const applications = ref([]);
        const loading = ref(true);

        const loadAllApplications = async () => {
            try {
                const response = await axios.get('/api/admin/applications');
                applications.value = response.data;
            } catch (error) {
                console.error('Error fetching all applications:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            loadAllApplications();
        });

        return {
            auth,
            applications,
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Student Applications</h2>
                    <p class="text-muted">Consolidated database of all recruitment registration activities</p>
                </div>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading registration history...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="applications.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-file-earmark-x text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Registration Actions Recorded</h5>
                <p class="text-secondary mb-0">Students have not applied to any recruitment drives yet.</p>
            </div>

            <!-- Table of all applications -->
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
