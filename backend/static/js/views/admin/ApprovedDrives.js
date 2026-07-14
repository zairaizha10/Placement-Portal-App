const { ref, onMounted, inject } = Vue;

export default {
    name: 'AdminApprovedDrives',
    setup() {
        const auth = inject('auth');
        const drives = ref([]);
        const loading = ref(true);

        const loadApprovedDrives = async () => {
            try {
                const response = await axios.get('/api/admin/drives/approved');
                drives.value = response.data;
            } catch (error) {
                console.error('Error fetching approved drives:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            loadApprovedDrives();
        });

        return {
            auth,
            drives,
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
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

            <!-- Empty State -->
            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-briefcase text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Active Drives</h5>
                <p class="text-secondary mb-0">There are no approved recruitment events currently published.</p>
            </div>

            <!-- Table of Approved drives -->
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
                            <td>
                                <span class="fw-semibold text-dark">{{ drive.job_title }}</span>
                            </td>
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
