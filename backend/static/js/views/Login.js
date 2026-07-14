const { ref, inject } = Vue;
const { useRouter } = VueRouter;

export default {
    name: 'Login',
    setup() {
        const router = useRouter();
        const auth = inject('auth');

        const email = ref('');
        const password = ref('');
        const loading = ref(false);
        const errorMessage = ref('');

        const handleLogin = async () => {
            if (!email.value || !password.value) {
                errorMessage.value = 'Please enter both email and password.';
                return;
            }

            loading.value = true;
            errorMessage.value = '';

            try {
                const response = await axios.post('/api/login', {
                    email: email.value,
                    password: password.value
                });

                const { token, role } = response.data;
                auth.login(token, role);

                if (role === 'student') {
                    router.push('/student/dashboard');
                } else if (role === 'company') {
                    router.push('/company/dashboard');
                } else if (role === 'admin') {
                    router.push('/admin/dashboard');
                }
            } catch (error) {
                console.error(error);
                errorMessage.value = error.response?.data?.message || 'Login failed. Please check your credentials.';
            } finally {
                loading.value = false;
            }
        };

        return {
            email,
            password,
            loading,
            errorMessage,
            handleLogin
        };
    },
    template: `
    <div class="auth-wrapper">
        <div class="auth-card fade-in">
            <div class="text-center mb-4">
                <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3" style="width: 60px; height: 60px;">
                    <i class="bi bi-person-badge fs-2"></i>
                </div>
                <h2 class="fw-bold text-dark">Placement Portal</h2>
                <p class="text-muted subtitle">Institute Recruitment System</p>
            </div>

            <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center py-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMessage }}</div>
            </div>

            <form @submit.prevent="handleLogin">
                <div class="mb-3">
                    <label for="email" class="form-label text-secondary fw-semibold">Email address</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                        <input type="email" id="email" class="form-control border-start-0 ps-0" placeholder="admin@placement.com" v-model="email" required>
                    </div>
                </div>

                <div class="mb-4">
                    <label for="password" class="form-label text-secondary fw-semibold">Password</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="bi bi-lock text-muted"></i></span>
                        <input type="password" id="password" class="form-control border-start-0 ps-0" placeholder="••••••••" v-model="password" required>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold text-white rounded-3 shadow-sm mb-3" :disabled="loading">
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <span v-else>Sign In</span>
                </button>
            </form>

            <div class="text-center">
                <p class="mb-0 text-muted">New user? 
                    <router-link to="/register" class="text-primary fw-semibold text-decoration-none">Create an Account</router-link>
                </p>
            </div>
        </div>
    </div>
    `
};
