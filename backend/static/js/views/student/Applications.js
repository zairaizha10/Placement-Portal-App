const { ref, onMounted, inject } = Vue;

export default {
    name: 'StudentApplications',
    setup() {
        const auth = inject('auth');
        const applications = ref([]);
        const loading = ref(true);
        const csvLoading = ref(false);
        const alertMsg = ref('');
        const alertType = ref('success');

        const loadApplications = async () => {
            try {
                const response = await axios.get('/api/student/applications');
                applications.value = response.data;
            } catch (error) {
                console.error('Error loading applications:', error);
            } finally {
                loading.value = false;
            }
        };

        const triggerCSVExport = async () => {
            csvLoading.value = true;
            alertMsg.value = '';
            try {
                const response = await axios.post('/api/student/export-applications');
                alertMsg.value = 'CSV export batch job triggered successfully! The system is preparing your file in the background.';
                alertType.value = 'success';

                // Simulate waiting 2 seconds then downloading
                setTimeout(async () => {
                    try {
                        window.open('/api/student/export-download', '_blank');
                    } catch (err) {
                        console.error('Download failed', err);
                    }
                    csvLoading.value = false;
                }, 2500);

            } catch (error) {
                console.error('CSV Export Error:', error);
                alertMsg.value = error.response?.data?.message || 'Failed to start CSV export job.';
                alertType.value = 'danger';
                csvLoading.value = false;
            }
        };

        const downloadOfferLetter = (appId) => {
            window.open(`/api/company/application/${appId}/offer-letter`, '_blank');
        };

        onMounted(() => {
            loadApplications();
        });

        return {
            auth,
            applications,
            loading,
            csvLoading,
            alertMsg,
            alertType,
            triggerCSVExport,
            downloadOfferLetter
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
                    <router-link to="/student/drives" class="sidebar-nav-link">
                        <i class="bi bi-briefcase"></i> View Drives
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/applications" class="sidebar-nav-link active">
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
                    <h2 class="fw-bold mb-1">My Applications</h2>
                    <p class="text-muted">Track your job applications and recruitment status</p>
                </div>
                <button @click="triggerCSVExport" class="btn btn-success d-flex align-items-center gap-2 px-3 py-2 text-white fw-semibold rounded-3 shadow-sm" :disabled="csvLoading">
                    <span v-if="csvLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-file-earmark-spreadsheet"></i>
                    Export History (CSV)
                </button>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <!-- Loading Spinner -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading applications...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="applications.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-file-earmark-text text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Applications Found</h5>
                <p class="text-secondary mb-3">You have not applied for any placement drives yet.</p>
                <router-link to="/student/drives" class="btn btn-primary px-4 text-white fw-semibold rounded-3 shadow-sm">Browse Drives</router-link>
            </div>

            <!-- Applications Table -->
            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Company</th>
                            <th class="py-3">Job Title</th>
                            <th class="py-3">Applied On</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3">Details / Offer Letter</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in applications" :key="app.application_id">
                            <td class="fw-semibold text-dark">{{ app.company }}</td>
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
                            <td>
                                <!-- If Selected, show Offer Letter download -->
                                <button v-if="app.status === 'Selected'" @click="downloadOfferLetter(app.application_id)" class="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 py-1 px-3 rounded-pill fw-semibold">
                                    <i class="bi bi-download"></i> Offer Letter (PDF)
                                </button>
                                <!-- If Shortlisted, show Interview details -->
                                <div v-else-if="app.status === 'Shortlisted' && app.interview_date" class="small bg-warning-subtle text-warning-emphasis p-2 rounded-3" style="max-width: 300px;">
                                    <h6 class="fw-bold mb-1" style="font-size: 0.85rem;"><i class="bi bi-calendar-event me-1"></i>Interview Scheduled</h6>
                                    <div class="mb-1"><strong>Time:</strong> {{ app.interview_date.replace('T', ' ') }}</div>
                                    <div class="mb-1"><strong>Mode:</strong> {{ app.interview_mode }}</div>
                                    <div v-if="app.interview_link"><strong>Link:</strong> <a :href="app.interview_link" target="_blank" class="text-break">{{ app.interview_link }}</a></div>
                                </div>
                                <span v-else class="text-muted small">No immediate actions required</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};
