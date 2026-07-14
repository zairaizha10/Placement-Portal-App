const { ref, onMounted, inject } = Vue;

export default {
    name: 'StudentResume',
    setup() {
        const auth = inject('auth');
        const resumeUrl = ref('');
        const resumeText = ref(''); // For ATS scanner
        const loading = ref(true);
        const saving = ref(false);
        const scanLoading = ref(false);

        // Scan Results
        const scanned = ref(false);
        const atsScore = ref(0);
        const matchedSkills = ref([]);
        const missingSkills = ref([]);
        const suggestions = ref([]);

        const alertMsg = ref('');
        const alertType = ref('success');

        const loadResume = async () => {
            try {
                const response = await axios.get('/api/student/profile');
                resumeUrl.value = response.data.resume || '';
            } catch (error) {
                console.error('Error loading resume:', error);
            } finally {
                loading.value = false;
            }
        };

        const handleSave = async () => {
            saving.value = true;
            alertMsg.value = '';
            try {
                const response = await axios.put('/api/student/resume', {
                    resume_url: resumeUrl.value
                });
                alertMsg.value = response.data.message || 'Resume URL updated successfully!';
                alertType.value = 'success';
            } catch (error) {
                console.error('Error updating resume URL:', error);
                alertMsg.value = error.response?.data?.message || 'Failed to update resume.';
                alertType.value = 'danger';
            } finally {
                saving.value = false;
            }
        };

        const runATSCheck = async () => {
            if (!resumeText.value.trim()) {
                alert('Please enter your resume content or copy-paste text to scan.');
                return;
            }
            scanLoading.value = true;
            scanned.value = false;
            try {
                const response = await axios.post('/api/student/resume/check', {
                    resume_text: resumeText.value
                });
                atsScore.value = response.data.score;
                matchedSkills.value = response.data.matched_skills;
                missingSkills.value = response.data.missing_skills;
                suggestions.value = response.data.suggestions;
                scanned.value = true;
            } catch (error) {
                console.error('ATS scan error:', error);
                alert('ATS scanner encountered an error. Please try again.');
            } finally {
                scanLoading.value = false;
            }
        };

        onMounted(() => {
            loadResume();
        });

        return {
            auth,
            resumeUrl,
            resumeText,
            loading,
            saving,
            scanLoading,
            scanned,
            atsScore,
            matchedSkills,
            missingSkills,
            suggestions,
            alertMsg,
            alertType,
            handleSave,
            runATSCheck
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
                    <router-link to="/student/profile" class="sidebar-nav-link">
                        <i class="bi bi-person-circle"></i> Profile
                    </router-link>
                </li>
                <li>
                    <router-link to="/student/resume" class="sidebar-nav-link active">
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
                    <h2 class="fw-bold mb-1">Resume Management</h2>
                    <p class="text-muted">Upload your CV profile and test it with our ATS score scanner</p>
                </div>
            </header>

            <!-- Alerts -->
            <div v-if="alertMsg" class="alert alert-dismissible fade show p-3" :class="'alert-' + alertType" role="alert">
                <i class="bi" :class="alertType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'"></i>
                <span class="ms-2 fw-semibold">{{ alertMsg }}</span>
                <button type="button" class="btn-close" @click="alertMsg = ''"></button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2">Loading resume profile...</p>
            </div>

            <div v-else class="row g-4 fade-in">
                <!-- Resume Link Section -->
                <div class="col-md-5">
                    <div class="card border-0 bg-white shadow-sm rounded-4 p-4 mb-4">
                        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">Resume URL</h5>
                        <form @submit.prevent="handleSave">
                            <div class="mb-3">
                                <label class="form-label text-secondary small fw-semibold">Hosted Resume Link (Google Drive, Dropbox, etc.)</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-white"><i class="bi bi-link-45deg text-muted"></i></span>
                                    <input type="url" class="form-control" placeholder="https://drive.google.com/..." v-model="resumeUrl" required>
                                </div>
                                <div class="form-text text-muted small">Please make sure the link is shareable so recruiters can view it.</div>
                            </div>
                            <button type="submit" class="btn btn-primary px-4 text-white fw-semibold rounded-pill shadow-sm" :disabled="saving">
                                <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Save Link
                            </button>
                        </form>

                        <div class="mt-4 pt-3 border-top" v-if="resumeUrl">
                            <a :href="resumeUrl" target="_blank" class="btn btn-outline-secondary w-100 py-2 rounded-3 fw-semibold">
                                <i class="bi bi-file-earmark-pdf me-2"></i> View Current Resume
                            </a>
                        </div>
                    </div>
                </div>

                <!-- ATS Scanner Section -->
                <div class="col-md-7">
                    <div class="card border-0 bg-white shadow-sm rounded-4 p-4">
                        <h5 class="fw-bold text-dark border-bottom pb-2 mb-3">
                            <i class="bi bi-robot text-primary me-2"></i>ATS Resume Scanner
                        </h5>
                        <p class="text-muted small">Copy and paste your resume text below to analyze compatibility against modern placement benchmarks.</p>
                        
                        <div class="mb-3">
                            <textarea class="form-control" rows="6" placeholder="Paste your resume details, work experience, projects, and skills here..." v-model="resumeText"></textarea>
                        </div>
                        
                        <button type="button" @click="runATSCheck" class="btn btn-outline-primary px-4 fw-semibold rounded-pill mb-4" :disabled="scanLoading">
                            <span v-if="scanLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            <i v-else class="bi bi-activity me-1"></i> Scan Resume Compatibility
                        </button>

                        <!-- ATS Scan Results -->
                        <div v-if="scanned" class="bg-light p-3 rounded-4 border fade-in">
                            <div class="d-flex align-items-center justify-content-between mb-4 border-bottom pb-2">
                                <h6 class="fw-bold text-dark mb-0"><i class="bi bi-bar-chart-fill text-success me-1"></i>ATS Evaluation Score</h6>
                                <span class="badge fs-5 rounded-pill px-3"
                                    :class="{
                                        'bg-danger': atsScore < 50,
                                        'bg-warning text-dark': atsScore >= 50 && atsScore < 75,
                                        'bg-success': atsScore >= 75
                                    }">
                                    {{ atsScore }}/100
                                </span>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-6 mb-3">
                                    <strong class="text-success small d-block mb-2"><i class="bi bi-check-circle-fill me-1"></i>Matched Skills Found:</strong>
                                    <div class="d-flex flex-wrap gap-1" v-if="matchedSkills.length > 0">
                                        <span class="badge bg-success-subtle text-success px-2 py-1 rounded-pill small fw-normal" v-for="skill in matchedSkills">{{ skill }}</span>
                                    </div>
                                    <span v-else class="text-muted small">No matched technical keywords found.</span>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <strong class="text-danger small d-block mb-2"><i class="bi bi-x-circle-fill me-1"></i>Missing Keywords:</strong>
                                    <div class="d-flex flex-wrap gap-1" v-if="missingSkills.length > 0">
                                        <span class="badge bg-danger-subtle text-danger px-2 py-1 rounded-pill small fw-normal" v-for="skill in missingSkills">{{ skill }}</span>
                                    </div>
                                    <span v-else class="text-muted small">Your resume contains all core technical keywords!</span>
                                </div>
                            </div>

                            <div class="border-top pt-3">
                                <strong class="text-dark small d-block mb-2"><i class="bi bi-lightbulb me-1"></i>Suggestions for Improvement:</strong>
                                <ul class="small text-secondary ps-3 mb-0">
                                    <li class="mb-1" v-for="sug in suggestions">{{ sug }}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    `
};
