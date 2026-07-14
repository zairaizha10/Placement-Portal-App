const { ref, onMounted, inject } = Vue;

export default {
    name: 'AdminPendingDrives',
    setup() {
        const auth = inject('auth');
        const drives = ref([]);
        const loading = ref(true);
        const alertMsg = ref('');
        const alertType = ref('success');

        const loadPendingDrives = async () => {
            try {
                const response = await axios.get('/api/admin/drives/pending');
                drives.value = response.data;
            } catch (error) {
                console.error('Error fetching pending drives:', error);
            } finally {
                loading.value = false;
            }
        };

        const handleApprove = async (id) => {
            alertMsg.value = '';
            try {
                const response = await axios.put(`/api/admin/drive/${id}/approve`);
                alertMsg.value = response.data.message || 'Drive approved and published!';
                alertType.value = 'success';
                loadPendingDrives();
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to approve drive.';
                alertType.value = 'danger';
            }
        };

        const handleReject = async (id) => {
            alertMsg.value = '';
            try {
                const response = await axios.put(`/api/admin/drive/${id}/reject`);
                alertMsg.value = response.data.message || 'Drive registration rejected.';
                alertType.value = 'warning';
                loadPendingDrives();
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to reject drive.';
                alertType.value = 'danger';
            }
        };

        onMounted(() => {
            loadPendingDrives();
        });

        return {
            auth,
            drives,
            loading,
            alertMsg,
            alertType,
            handleApprove,
            handleReject
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
                    <h2 class="fw-bold mb-1">Pending Drive Approvals</h2>
                    <p class="text-muted">Authorize submitted placement recruitment events</p>
                </div>
                <router-link to="/admin/approved-drives" class="btn btn-outline-primary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-briefcase me-1"></i> Approved Drives
                </router-link>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading submitted job drives...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-calendar-check text-success fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Pending Drives</h5>
                <p class="text-secondary mb-0">Recruiters have no outstanding job drives requiring verification.</p>
            </div>

            <!-- Drives Table -->
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
                            <td>
                                <span class="fw-semibold text-dark">{{ drive.job_title }}</span>
                            </td>
                            <td>{{ drive.branch }}</td>
                            <td><span class="badge bg-light text-dark border">{{ drive.min_cgpa }}</span></td>
                            <td class="text-center">
                                <span class="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-semibold">{{ drive.status }}</span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button @click="handleApprove(drive.id)" class="btn btn-sm btn-success text-white px-3 rounded-pill fw-semibold">
                                        <i class="bi bi-check-lg me-1"></i> Approve
                                    </button>
                                    <button @click="handleReject(drive.id)" class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-semibold">
                                        <i class="bi bi-x-lg me-1"></i> Reject
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
