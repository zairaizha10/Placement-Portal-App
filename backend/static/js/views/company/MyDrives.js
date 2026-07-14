const { ref, onMounted, inject } = Vue;

export default {
    name: 'CompanyMyDrives',
    setup() {
        const auth = inject('auth');
        const drives = ref([]);
        const loading = ref(true);

        const loadDrives = async () => {
            try {
                const response = await axios.get('/api/company/my-drives');
                drives.value = response.data;
            } catch (error) {
                console.error('Error loading drives:', error);
            } finally {
                loading.value = false;
            }
        };

        onMounted(() => {
            loadDrives();
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">My Drives</h2>
                    <p class="text-muted">Manage your registered recruitment drives and applicants</p>
                </div>
                <router-link to="/company/create-drive" class="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold rounded-3 shadow-sm">
                    <i class="bi bi-plus"></i> Create Drive
                </router-link>
            </header>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading your drives...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-folder2-open text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Placement Drives Created</h5>
                <p class="text-secondary mb-3">You have not created any recruitment drives yet.</p>
                <router-link to="/company/create-drive" class="btn btn-primary px-4 text-white fw-semibold rounded-3 shadow-sm">Create New Drive</router-link>
            </div>

            <!-- Table list of drives -->
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
                                <!-- Can view applicants only if drive is approved -->
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
