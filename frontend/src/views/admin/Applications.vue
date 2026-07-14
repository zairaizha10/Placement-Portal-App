<template>

<div class="applications-page">

    <h1>All Applications</h1>
    <table>
        <thead>
            <tr>
                <th>Student</th>
                <th>Company</th>
                <th>Job</th>
                <th>Status</th>
                <th>Applied On</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="application in applications"
                :key="application.application_id"
            >
                <td>{{ application.student_name }}</td>
                <td>{{ application.company }}</td>
                <td>{{ application.job_title }}</td>
                <td>{{ application.status }}</td>
                <td>{{ application.applied_on }}</td>
            </tr>
        </tbody>
    </table>
</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {getAllApplications} from "../../services/adminService"

const router=useRouter()

const applications=ref([])

async function loadApplications(){

try{

const response=await getAllApplications()

applications.value=response.data

}

catch(error){

console.log(error)

}

}

onMounted(()=>{

const token=localStorage.getItem("token")

if(!token){

router.push("/")

return

}

loadApplications()

})

</script>

<style scoped>

@import "./Applications.css";

</style>