const { ref } = Vue;
const { useRouter } = VueRouter;

export default {
    name: 'Register',
    setup() {
        const router = useRouter();

        const role = ref('student');
        const loading = ref(false);
        const errorMessage = ref('');
        const successMessage = ref('');

        const studentData = ref({
            full_name: '',
            branch: '',
            graduation_year: '',
            cgpa: '',
            phone: '',
            email: '',
            password: ''
        });

        const companyData = ref({
            company_name: '',
            hr_name: '',
            hr_email: '',
            website: '',
            description: '',
            email: '',
            password: ''
        });

        const handleRegister = async () => {
            loading.value = true;
            errorMessage.value = '';
            successMessage.value = '';

            try {
                if (role.value === 'student') {
                    const response = await axios.post('/api/register/student', studentData.value);
                    successMessage.value = response.data.message || 'Student registration successful!';
                } else {
                    const response = await axios.post('/api/register/company', companyData.value);
                    successMessage.value = response.data.message || 'Company profile registration submitted for admin approval!';
                }

                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } catch (error) {
                console.error(error);
                errorMessage.value = error.response?.data?.message || 'Registration failed. Please check inputs.';
            } finally {
                loading.value = false;
            }
        };

        return {
            role,
            loading,
            errorMessage,
            successMessage,
            studentData,
            companyData,
            handleRegister
        };
    },
    template: `
    <div class="auth-wrapper py-5">
        <div class="auth-card fade-in" style="max-width: 600px;">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 50px; height: 50px;">
                    <i class="bi bi-person-plus fs-3"></i>
                </div>
                <h3 class="fw-bold text-dark mb-1">Create an Account</h3>
                <p class="text-muted small">Join our Recruitment Portal</p>
            </div>

            <!-- Role Selector tabs -->
            <div class="d-flex justify-content-center gap-2 mb-4">
                <button type="button" class="btn px-4 py-2 fw-semibold rounded-3 flex-grow-1"
                    :class="role === 'student' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'"
                    @click="role = 'student'">
                    <i class="bi bi-mortarboard me-2"></i>Student
                </button>
                <button type="button" class="btn px-4 py-2 fw-semibold rounded-3 flex-grow-1"
                    :class="role === 'company' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'"
                    @click="role = 'company'">
                    <i class="bi bi-building me-2"></i>Company
                </button>
            </div>

            <div v-if="errorMessage" class="alert alert-danger py-2 small" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success py-2 small" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            </div>

            <form @submit.prevent="handleRegister">
                <!-- Student Forms -->
                <div v-if="role === 'student'">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Full Name</label>
                        <input type="text" class="form-control" placeholder="John Doe" v-model="studentData.full_name" required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Branch/Major</label>
                            <input type="text" class="form-control" placeholder="Computer Science" v-model="studentData.branch" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Graduation Year</label>
                            <input type="number" class="form-control" placeholder="2026" v-model="studentData.graduation_year" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">CGPA</label>
                            <input type="number" step="0.01" min="0" max="10" class="form-control" placeholder="9.5" v-model="studentData.cgpa" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">Phone Number</label>
                            <input type="tel" class="form-control" placeholder="9876543210" v-model="studentData.phone" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Email Address</label>
                        <input type="email" class="form-control" placeholder="john@student.com" v-model="studentData.email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-secondary fw-semibold small">Password</label>
                        <input type="password" class="form-control" placeholder="••••••••" v-model="studentData.password" required>
                    </div>
                </div>

                <!-- Company Forms -->
                <div v-if="role === 'company'">
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Name</label>
                        <input type="text" class="form-control" placeholder="Acme Corporation" v-model="companyData.company_name" required>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">HR Contact Name</label>
                            <input type="text" class="form-control" placeholder="Alice Smith" v-model="companyData.hr_name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-secondary fw-semibold small">HR Contact Email</label>
                            <input type="email" class="form-control" placeholder="hr@acme.com" v-model="companyData.hr_email" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Website</label>
                        <input type="url" class="form-control" placeholder="https://acme.com" v-model="companyData.website" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Company Description</label>
                        <textarea class="form-control" rows="3" placeholder="Provide a brief description of your company..." v-model="companyData.description" required></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label text-secondary fw-semibold small">Account Login Email</label>
                        <input type="email" class="form-control" placeholder="hr_login@acme.com" v-model="companyData.email" required>
                    </div>
                    <div class="mb-4">
                        <label class="form-label text-secondary fw-semibold small">Password</label>
                        <input type="password" class="form-control" placeholder="••••••••" v-model="companyData.password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold text-white rounded-3 mb-3" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-else>Register</span>
                </button>
            </form>

            <div class="text-center">
                <p class="mb-0 text-muted small">Already have an account? 
                    <router-link to="/" class="text-primary fw-semibold text-decoration-none">Sign In</router-link>
                </p>
            </div>
        </div>
    </div>
    `
};
