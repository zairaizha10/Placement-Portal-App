const { ref, onMounted, inject, watch } = Vue;

export default {
    name: 'StudentDrives',
    setup() {
        const auth = inject('auth');
        const drives = ref([]);
        const keyword = ref('');
        const loading = ref(true);
        const alertMsg = ref('');
        const alertType = ref('success');

        const loadDrives = async () => {
            loading.value = true;
            try {
                let response;
                if (keyword.value.trim()) {
                    response = await axios.get(`/api/student/search-drives?keyword=${encodeURIComponent(keyword.value)}`);
                    // Note: The search endpoint response structures are slightly different (e.g., drive_id vs id).
                    // We will map them uniformly so they render correctly.
                    drives.value = response.data.map(d => ({
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
                    response = await axios.get('/api/student/drives');
                    drives.value = response.data;
                }
            } catch (error) {
                console.error('Error loading drives:', error);
            } finally {
                loading.value = false;
            }
        };

        const handleApply = async (driveId) => {
            alertMsg.value = '';
            try {
                const response = await axios.post(`/api/student/apply/${driveId}`);
                alertMsg.value = response.data.message || 'Successfully applied!';
                alertType.value = 'success';
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Eligibility check failed or already applied.';
                alertType.value = 'danger';
            }
            // Auto hide alert after 4 seconds
            setTimeout(() => {
                alertMsg.value = '';
            }, 4000);
        };

        onMounted(() => {
            loadDrives();
        });

        // Trigger search when typing stops (debounce) or user clears search
        let timeout = null;
        watch(keyword, () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                loadDrives();
            }, 3000); // 300ms debounce
        });

        return {
            auth,
            drives,
            keyword,
            loading,
            alertMsg,
            alertType,
            loadDrives,
            handleApply
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
                <button @click="auth.logout" class="btn btn-outline-danger w-100 py-2 d-flex align-items-center justify-content-center gap-2 rounded-3 border-0">
                    <i class="bi bi-box-arrow-left"></i> Logout
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Placement Drives</h2>
                    <p class="text-muted">Browse and apply to active job recruitments</p>
                </div>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <!-- Search Bar -->
            <div class="mb-4">
                <div class="input-group" style="max-width: 500px;">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input type="text" class="form-control border-start-0 ps-0" placeholder="Search by job title..." v-model="keyword" @keyup.enter="loadDrives">
                    <button class="btn btn-primary" type="button" @click="loadDrives">Search</button>
                </div>
            </div>

            <!-- Loading Spinner -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Fetching active placement drives...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="drives.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-briefcase text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Placement Drives Found</h5>
                <p class="text-secondary mb-0">There are no approved placement drives matching your criteria at this moment.</p>
            </div>

            <!-- Drives Cards Grid -->
            <div v-else class="row g-4 fade-in">
                <div class="col-md-6 col-lg-4" v-for="drive in drives" :key="drive.id">
                    <div class="card border border-light shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h5 class="fw-bold text-dark mb-0">{{ drive.job_title }}</h5>
                                <small class="text-muted d-block mt-1">
                                    <i class="bi bi-building me-1"></i>{{ drive.company_name || 'Approved Recruiter' }}
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
