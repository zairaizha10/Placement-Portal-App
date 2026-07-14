<template>

<div class="applications-page">

    <h1>Student Applications</h1>

    <h3 v-if="students.length===0">

        No Applications Found

    </h3>

    <table v-else>

        <thead>
            <tr>
                <th>Name</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Graduation</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="student in students"
                :key="student.application_id"
            >
                <td>{{ student.student_name }}</td>
                <td>{{ student.branch }}</td>
                <td>{{ student.cgpa }}</td>
                <td>{{ student.graduation_year }}</td>
                <td>{{ student.status }}</td>
                <td>
                    <div class="schedule-section">
                        <div class="schedule-inputs">
                            <input
                                type="datetime-local"
                                v-model="interviewData.interview_date"
                            />
                            <input
                                type="text"
                                placeholder="Online / Offline"
                                v-model="interviewData.interview_mode"
                            />
                            <input
                                type="text"
                                placeholder="Interview Link"
                                v-model="interviewData.interview_link"
                            />
                        </div>
                        <button
                            class="schedule-btn"
                            @click="handleSchedule(student.application_id)"
                        >
                            Schedule Interview
                        </button>
                        <div class="action-buttons">
                            <button
                                @click="handleStatus(student.application_id,'Shortlisted')"
                            >
                                Shortlist
                            </button>

                            <button
                                @click="handleStatus(student.application_id,'Rejected')"
                            >
                                Reject
                            </button>

                            <button
                                @click="handleStatus(student.application_id,'Selected')"
                            >
                                Select
                            </button>

                            <button
                                @click="viewResume(student.resume)"
                                :disabled="!student.resume"
                            >
                                View Resume
                            </button>
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

</template>

<script setup>

import { ref,onMounted } from "vue"

import { useRoute } from "vue-router"

import {

getApplicants,

updateApplicationStatus,

scheduleInterview

} from "../../services/companyService"

const route=useRoute()

const driveId=route.params.driveId

const students=ref([])

const interviewData=ref({

    interview_date:"",

    interview_mode:"",

    interview_link:""

})

async function loadApplicants(){

    try{

        const response=await getApplicants(driveId)

        students.value=response.data

    }

    catch(error){

        console.log(error)

    }

}

onMounted(loadApplicants)

async function handleStatus(id,status){

    try{

        const response=await updateApplicationStatus(id,status)

        alert(response.data.message)

        loadApplicants()

    }

    catch(error){

        console.log(error)

    }

}

async function handleSchedule(applicationId){

    try{
        await scheduleInterview(
            applicationId,
            interviewData.value
        )
        alert("Interview Scheduled Successfully")
    }
    catch(error){
        console.log(error)
    }

}

function viewResume(resume){

    window.open(resume,"_blank")
}

</script>
<style scoped>
@import "./Applicants.css";
</style>