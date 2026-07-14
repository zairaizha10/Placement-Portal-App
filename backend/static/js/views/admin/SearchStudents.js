const { ref, onMounted, inject } = Vue;

export default {
    name: 'AdminSearchStudents',
    setup() {
        const auth = inject('auth');
        const students = ref([]);
        const keyword = ref('');
        const loading = ref(false);
        const alertMsg = ref('');
        const alertType = ref('success');

        const search = async () => {
            loading.value = true;
            alertMsg.value = '';
            try {
                const response = await axios.get(`/api/admin/search/students?keyword=${encodeURIComponent(keyword.value)}`);
                students.value = response.data;
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to search students.';
                alertType.value = 'danger';
            } finally {
                loading.value = false;
            }
        };

        const handleDeactivate = async (id) => {
            alertMsg.value = '';
            try {
                const response = await axios.put(`/api/admin/student/${id}/deactivate`);
                alertMsg.value = response.data.message || 'Student deactivated successfully!';
                alertType.value = 'warning';
                search(); // Refresh search list
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to deactivate student.';
                alertType.value = 'danger';
            }
        };

        onMounted(() => {
            search();
        });

        return {
            auth,
            students,
            keyword,
            loading,
            alertMsg,
            alertType,
            search,
            handleDeactivate
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Search Students</h2>
                    <p class="text-muted">Manage academic profiles and deactivate candidates</p>
                </div>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <!-- Search bar -->
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

            <!-- Empty State -->
            <div v-else-if="students.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-person-x text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Students Found</h5>
                <p class="text-secondary mb-0">Try search queries with alternative spelling variations.</p>
            </div>

            <!-- Students List Table -->
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
                            <td>
                                <span class="fw-semibold text-dark">{{ student.name }}</span>
                            </td>
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
                                    <i class="bi bi-slash-circle me-1"></i> Deactivate
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
