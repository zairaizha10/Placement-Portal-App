const { ref, onMounted, inject } = Vue;

export default {
    name: 'StudentProfile',
    setup() {
        const auth = inject('auth');
        const profile = ref({
            full_name: '',
            email: '',
            branch: '',
            cgpa: 0,
            graduation_year: 0,
            phone: '',
            placement_status: '',
            resume: ''
        });
        const editing = ref(false);
        const loading = ref(true);
        const saving = ref(false);
        const alertMsg = ref('');
        const alertType = ref('success');

        const loadProfile = async () => {
            try {
                const response = await axios.get('/api/student/profile');
                profile.value = response.data;
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                loading.value = false;
            }
        };

        const handleUpdate = async () => {
            saving.value = true;
            alertMsg.value = '';
            try {
                const response = await axios.put('/api/student/profile', {
                    full_name: profile.value.full_name,
                    branch: profile.value.branch,
                    cgpa: profile.value.cgpa,
                    graduation_year: profile.value.graduation_year,
                    phone: profile.value.phone
                });
                alertMsg.value = response.data.message || 'Profile updated successfully!';
                alertType.value = 'success';
                editing.value = false;
                loadProfile();
            } catch (error) {
                console.error('Error updating profile:', error);
                alertMsg.value = error.response?.data?.message || 'Failed to update profile details.';
                alertType.value = 'danger';
            } finally {
                saving.value = false;
            }
        };

        onMounted(() => {
            loadProfile();
        });

        return {
            auth,
            profile,
            editing,
            loading,
            saving,
            alertMsg,
            alertType,
            handleUpdate
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
                    <router-link to="/student/applications" class="sidebar-nav-link">
                        <i class="bi bi-file-earmark-check"></i> My Applications
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/profile" class="sidebar-nav-link active">
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
                    <h2 class="fw-bold mb-1">My Profile</h2>
                    <p class="text-muted">Manage your personal and academic information</p>
                </div>
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
                <p class="text-muted mt-2">Loading profile details...</p>
            </div>

            <!-- Profile View & Edit form -->
            <div v-else class="card border-0 bg-white shadow-sm rounded-4 p-4 fade-in" style="max-width: 800px;">
                <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
                    <h5 class="fw-bold text-dark mb-0">Personal Profile File</h5>
                    <button v-if="!editing" @click="editing = true" class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-semibold">
                        <i class="bi bi-pencil me-1"></i> Edit Profile
                    </button>
                </div>

                <form @submit.prevent="handleUpdate">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Full Name</label>
                            <input type="text" class="form-control" v-model="profile.full_name" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Email Address</label>
                            <input type="email" class="form-control bg-light" v-model="profile.email" disabled>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Academic Branch</label>
                            <input type="text" class="form-control" v-model="profile.branch" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Current CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" v-model="profile.cgpa" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Graduation Year</label>
                            <input type="number" class="form-control" v-model="profile.graduation_year" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Phone Number</label>
                            <input type="tel" class="form-control" v-model="profile.phone" :disabled="!editing" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary small fw-semibold">Placement Status</label>
                            <span class="d-block py-2 fw-semibold" :class="profile.placement_status === 'Placed' ? 'text-success' : 'text-warning'">
                                {{ profile.placement_status }}
                            </span>
                        </div>
                    </div>

                    <div v-if="editing" class="d-flex justify-content-end gap-2 border-top pt-3">
                        <button type="button" @click="editing = false" class="btn btn-outline-secondary px-4 rounded-pill fw-semibold">Cancel</button>
                        <button type="submit" class="btn btn-primary px-4 text-white rounded-pill fw-semibold shadow-sm" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>
    `
};
