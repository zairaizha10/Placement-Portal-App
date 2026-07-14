const { ref, onMounted, inject } = Vue;
const { useRoute } = VueRouter;

export default {
    name: 'CompanyApplicants',
    setup() {
        const auth = inject('auth');
        const route = useRoute();
        const driveId = route.params.driveId;

        const students = ref([]);
        const loading = ref(true);

        // Store interview form data keyed by application ID
        const interviewForms = ref({});

        const alertMsg = ref('');
        const alertType = ref('success');

        const loadApplicants = async () => {
            try {
                const response = await axios.get(`/api/company/drive/${driveId}/applications`);
                students.value = response.data;

                // Initialize form states
                response.data.forEach(student => {
                    if (!interviewForms.value[student.application_id]) {
                        interviewForms.value[student.application_id] = {
                            interview_date: '',
                            interview_mode: 'Online',
                            interview_link: '',
                            showForm: false
                        };
                    }
                });
            } catch (error) {
                console.error('Error loading applicants:', error);
            } finally {
                loading.value = false;
            }
        };

        const handleStatus = async (appId, status) => {
            alertMsg.value = '';
            try {
                const response = await axios.put(`/api/company/application/${appId}/status`, { status });
                alertMsg.value = response.data.message || `Status updated to ${status}.`;
                alertType.value = 'success';
                loadApplicants();
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to update status.';
                alertType.value = 'danger';
            }
        };

        const handleSchedule = async (appId) => {
            alertMsg.value = '';
            const formData = interviewForms.value[appId];

            if (!formData.interview_date || !formData.interview_mode) {
                alert('Please provide interview date and mode.');
                return;
            }

            try {
                const response = await axios.put(`/api/company/application/${appId}/schedule-interview`, {
                    interview_date: formData.interview_date,
                    interview_mode: formData.interview_mode,
                    interview_link: formData.interview_link
                });

                alertMsg.value = response.data.message || 'Interview scheduled successfully!';
                alertType.value = 'success';
                formData.showForm = false;
                loadApplicants();
            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to schedule interview.';
                alertType.value = 'danger';
            }
        };

        const downloadOfferLetter = (appId) => {
            window.open(`/api/company/application/${appId}/offer-letter`, '_blank');
        };

        const viewResume = (resumeUrl) => {
            if (resumeUrl) {
                window.open(resumeUrl, '_blank');
            } else {
                alert('This student has not uploaded a resume yet.');
            }
        };

        onMounted(() => {
            loadApplicants();
        });

        return {
            auth,
            students,
            loading,
            interviewForms,
            alertMsg,
            alertType,
            handleStatus,
            handleSchedule,
            downloadOfferLetter,
            viewResume
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
                    <h2 class="fw-bold mb-1">Student Applicants</h2>
                    <p class="text-muted">Review, filter, and schedule placement interactions</p>
                </div>
                <router-link to="/company/my-drives" class="btn btn-outline-secondary px-3 py-2 fw-semibold rounded-3">
                    <i class="bi bi-arrow-left me-1"></i> Back to Drives
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
                <p class="text-muted mt-2">Loading student applicants...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="students.length === 0" class="text-center py-5 bg-white border rounded-4 shadow-sm">
                <i class="bi bi-people text-muted fs-1 mb-3 d-block"></i>
                <h5 class="fw-bold text-dark">No Applicants Yet</h5>
                <p class="text-secondary mb-0">No students have applied to this placement drive yet.</p>
            </div>

            <!-- Applicants Table -->
            <div v-else class="table-responsive border-0 bg-white shadow-sm rounded-4 p-4 fade-in">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr class="table-light">
                            <th class="py-3">Name</th>
                            <th class="py-3">Branch</th>
                            <th class="py-3">CGPA</th>
                            <th class="py-3">Graduation</th>
                            <th class="py-3 text-center">Status</th>
                            <th class="py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="student in students" :key="student.application_id">
                            <tr>
                                <td>
                                    <span class="fw-semibold text-dark">{{ student.student_name }}</span>
                                </td>
                                <td>{{ student.branch }}</td>
                                <td><span class="badge bg-light text-dark border">{{ student.cgpa }}</span></td>
                                <td>{{ student.graduation_year }}</td>
                                <td class="text-center">
                                    <span class="badge px-3 py-2 rounded-pill fw-semibold text-uppercase"
                                        :class="{
                                            'bg-primary-subtle text-primary': student.status === 'Applied',
                                            'bg-warning-subtle text-warning': student.status === 'Shortlisted',
                                            'bg-success-subtle text-success': student.status === 'Selected',
                                            'bg-danger-subtle text-danger': student.status === 'Rejected'
                                        }">
                                        {{ student.status }}
                                    </span>
                                </td>
                                <td>
                                    <div class="d-flex justify-content-center gap-2">
                                        <!-- View Resume -->
                                        <button @click="viewResume(student.resume)" class="btn btn-sm btn-outline-secondary px-2 rounded-pill fw-semibold" title="View Resume">
                                            <i class="bi bi-file-earmark-pdf"></i> Resume
                                        </button>

                                        <!-- Shortlist -->
                                        <button v-if="student.status === 'Applied'" @click="handleStatus(student.application_id, 'Shortlisted')" class="btn btn-sm btn-warning px-2 text-white fw-semibold rounded-pill" title="Shortlist Student">
                                            Shortlist
                                        </button>

                                        <!-- Schedule Interview Trigger (only for shortlisted) -->
                                        <button v-if="student.status === 'Shortlisted'" @click="interviewForms[student.application_id].showForm = !interviewForms[student.application_id].showForm" class="btn btn-sm btn-outline-warning px-2 fw-semibold rounded-pill">
                                            <i class="bi bi-calendar-plus"></i> Interview
                                        </button>

                                        <!-- Select -->
                                        <button v-if="['Applied', 'Shortlisted'].includes(student.status)" @click="handleStatus(student.application_id, 'Selected')" class="btn btn-sm btn-success px-2 text-white fw-semibold rounded-pill" title="Select Student">
                                            Select
                                        </button>

                                        <!-- Reject -->
                                        <button v-if="['Applied', 'Shortlisted'].includes(student.status)" @click="handleStatus(student.application_id, 'Rejected')" class="btn btn-sm btn-danger px-2 text-white fw-semibold rounded-pill" title="Reject Student">
                                            Reject
                                        </button>

                                        <!-- Download Offer Letter (only for selected) -->
                                        <button v-if="student.status === 'Selected'" @click="downloadOfferLetter(student.application_id)" class="btn btn-sm btn-outline-success px-3 rounded-pill fw-semibold">
                                            <i class="bi bi-download"></i> Offer Letter
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Expandable Interview Scheduling Drawer -->
                            <tr v-if="interviewForms[student.application_id].showForm">
                                <td colspan="6" class="bg-light p-3 border-top">
                                    <div class="card border-0 shadow-sm p-3 rounded-3" style="max-width: 700px; margin: 0 auto;">
                                        <h6 class="fw-bold text-dark mb-3"><i class="bi bi-calendar-event text-warning me-1"></i>Schedule Recruitment Interview</h6>
                                        <div class="row g-3">
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Date & Time</label>
                                                <input type="datetime-local" class="form-control form-control-sm" v-model="interviewForms[student.application_id].interview_date">
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Mode</label>
                                                <select class="form-select form-select-sm" v-model="interviewForms[student.application_id].interview_mode">
                                                    <option value="Online">Online Link</option>
                                                    <option value="Offline">In-Person Office</option>
                                                </select>
                                            </div>
                                            <div class="col-md-4">
                                                <label class="form-label text-secondary small fw-semibold">Link or Venue</label>
                                                <input type="text" class="form-control form-control-sm" placeholder="Zoom Link / Conference Room" v-model="interviewForms[student.application_id].interview_link">
                                            </div>
                                        </div>
                                        <div class="d-flex justify-content-end gap-2 mt-3">
                                            <button type="button" @click="interviewForms[student.application_id].showForm = false" class="btn btn-sm btn-outline-secondary px-3 rounded-pill">Cancel</button>
                                            <button type="button" @click="handleSchedule(student.application_id)" class="btn btn-sm btn-warning text-white px-3 rounded-pill fw-semibold">Schedule Now</button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
    `
};
