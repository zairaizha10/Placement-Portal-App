<template>

<div class="applications-page">

    <h1>My Applications</h1>

    <div class="mb-3">

        <button
            class="btn btn-success me-2"
            @click="exportCSV"
        >
            Export Applications CSV
        </button>

        <button
            class="btn btn-primary"
            @click="downloadCSV"
        >
            Download Applications CSV
        </button>

    </div>

    <div class="application-list">

        <div
            class="application-card"
            v-for="app in applications"
            :key="app.application_id"
        >

            <h2>{{ app.company }}</h2>

            <p>
                <strong>Job Title:</strong>
                {{ app.job_title }}
            </p>

            <p>
                <strong>Status:</strong>
                {{ app.status }}
            </p>

            <p>
                <strong>Applied On:</strong>
                {{ app.applied_on }}
            </p>

            <p>
                <strong>Interview Date:</strong>

                {{
                    app.interview_date &&
                    app.interview_date !== "None"
                    ? app.interview_date
                    : "Not Scheduled"
                }}

            </p>

            <p>

                <strong>Interview Mode:</strong>
                {{ app.interview_mode || "-" }}
            </p>

            <p>
                <strong>Interview Link:</strong>
                <a
                    v-if="app.interview_link"
                    :href="app.interview_link"
                    target="_blank"
                >
                    Join Interview
                </a>
                <span v-else>-</span>
            </p>
        </div>
    </div>
</div>

</template>

<script setup>

import { ref, onMounted } from "vue";
import axios from "axios";

import {
    getMyApplications
} from "../../services/studentService";

const applications = ref([]);

onMounted(async () => {

    try {

        const response = await getMyApplications();
        applications.value = response.data;

    }

    catch (error) {

        console.log(error);

    }

});

const exportCSV = async () => {

    try {

        await axios.post(

            "http://127.0.0.1:5000/api/student/export-applications",

            {},

            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        );

        alert("CSV generation started. You will receive an email once it is ready.");

    }

    catch (error) {

        alert(
            error.response?.data?.message ||
            "Export Failed"
        );

    }

};

const downloadCSV = async () => {

    try {
        const response = await axios.get(
            "http://127.0.0.1:5000/api/student/export-download",
            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                },
                responseType: "blob"

            }

        );

        const url = window.URL.createObjectURL(

            new Blob([response.data])

        );
        const link = document.createElement("a");

        link.href = url;

        link.download = "applications.csv";

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    }

    catch (error) {
        alert("CSV not ready yet. Please export first and try again after a few seconds.");
    }
};

</script>
<style scoped>
@import "./MyApplications.css";
</style>