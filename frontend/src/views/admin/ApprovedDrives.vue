<template>

<div class="pending-page">

    <h1>Approved Drives</h1>

    <table>
        <thead>
            <tr>
                <th>Job Title</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="drive in drives"
                :key="drive.id"
            >
                <td>{{ drive.job_title }}</td>
                <td>{{ drive.branch }}</td>
                <td>{{ drive.min_cgpa }}</td>
                <td>{{ drive.status }}</td>
            </tr>
        </tbody>
    </table>
</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {getApprovedDrives} from "../../services/adminService"

const drives=ref([])

async function loadDrives(){

try{

const response=await getApprovedDrives()

drives.value=response.data

}

catch(error){

console.log(error)

}

}

onMounted(()=>{

loadDrives()

})

</script>

<style scoped>

@import "./PendingDrives.css";

</style>