import router from './router.js';

const { createApp, ref, provide } = Vue;

const App = {
    setup() {
        const token = ref(localStorage.getItem('token') || '');
        const role = ref(localStorage.getItem('role') || '');

        const login = (newToken, newRole) => {
            token.value = newToken;
            role.value = newRole;
            localStorage.setItem('token', newToken);
            localStorage.setItem('role', newRole);
        };

        const logout = () => {
            token.value = '';
            role.value = '';
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            router.push('/');
        };


        provide('auth', {
            token,
            role,
            login,
            logout
        });

        axios.interceptors.request.use((config) => {
            const currentToken = localStorage.getItem('token');
            if (currentToken) {
                config.headers.Authorization = `Bearer ${currentToken}`;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });


        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && (error.response.status === 401 || error.response.status === 422)) {
                    // Token is invalid/expired
                    logout();
                }
                return Promise.reject(error);
            }
        );

        return {};
    },
    template: `<router-view></router-view>`
};

const app = createApp(App);
app.use(router);
app.mount('#app');
