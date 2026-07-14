const { ref, inject } = Vue;
const { useRouter } = VueRouter;

export default {
    name: 'CompanyCreateDrive',
    setup() {
        const auth = inject('auth');
        const router = useRouter();
        const loading = ref(false);
        const alertMsg = ref('');
        const alertType = ref('success');

        const form = ref({
            job_title: '',
            job_description: '',
            branch: '',
            min_cgpa: '',
            graduation_year: '',
            package: '',
            location: '',
            deadline: ''
        });

        const handleSubmit = async () => {
            loading.value = true;
            alertMsg.value = '';

            try {
                const response = await axios.post('/api/company/create-drive', {
                    job_title: form.value.job_title,
                    job_description: form.value.job_description,
                    branch: form.value.branch,
                    min_cgpa: parseFloat(form.value.min_cgpa),
                    graduation_year: parseInt(form.value.graduation_year),
                    package: parseFloat(form.value.package),
                    location: form.value.location,
                    deadline: form.value.deadline
                });

                alertMsg.value = response.data.message || 'Placement drive submitted successfully!';
                alertType.value = 'success';

                // Reset Form
                form.value = {
                    job_title: '',
                    job_description: '',
                    branch: '',
                    min_cgpa: '',
                    graduation_year: '',
                    package: '',
                    location: '',
                    deadline: ''
                };

                setTimeout(() => {
                    router.push('/company/my-drives');
                }, 2000);

            } catch (error) {
                console.error(error);
                alertMsg.value = error.response?.data?.message || 'Failed to submit placement drive.';
                alertType.value = 'danger';
            } finally {
                loading.value = false;
            }
        };

        return {
            auth,
            form,
            loading,
            alertMsg,
            alertType,
            handleSubmit
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
                    <router-link to="/company/create-drive" class="sidebar-nav-link active">
                        <i class="bi bi-plus-circle"></i> Create Drive
                    </router-link>
                </li>
                <li>
                    <router-link to="/company/my-drives" class="sidebar-nav-link">
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
            <header class="mb-4">
                <h2 class="fw-bold mb-1">Create Placement Drive</h2>
                <p class="text-muted">Register a new recruitment event (Requires admin validation)</p>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <!-- Form Card -->
            <div class="card border-0 bg-white shadow-sm rounded-4 p-4 fade-in" style="max-width: 800px;">
                <form @submit.prevent="handleSubmit">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Job Title</label>
                            <input type="text" class="form-control" placeholder="Software Engineer Intern" v-model="form.job_title" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Eligible Academic Branch</label>
                            <input type="text" class="form-control" placeholder="Computer Science" v-model="form.branch" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Minimum CGPA Requirement</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" placeholder="7.5" v-model="form.min_cgpa" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Eligible Graduation Year</label>
                            <input type="number" class="form-control" placeholder="2026" v-model="form.graduation_year" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Package offered (LPA)</label>
                            <input type="number" step="0.1" class="form-control" placeholder="12.0" v-model="form.package" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Job Location</label>
                            <input type="text" class="form-control" placeholder="Bangalore / Remote" v-model="form.location" required>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-secondary small fw-semibold">Job Description</label>
                            <textarea class="form-control" rows="4" placeholder="Detail work responsibilities, required skills, and context..." v-model="form.job_description" required></textarea>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Application Deadline Date</label>
                            <input type="date" class="form-control" v-model="form.deadline" required>
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-2 border-top pt-3">
                        <button type="submit" class="btn btn-primary px-4 text-white rounded-pill fw-semibold shadow-sm" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Create Drive
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
    `
};
