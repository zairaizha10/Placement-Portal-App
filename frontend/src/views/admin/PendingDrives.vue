<template>

<div class="pending-page">

<h1>Pending Drives</h1>

<table>

<thead>

<tr>

<th>Job Title</th>

<th>Branch</th>

<th>CGPA</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

<tr
v-for="drive in drives"
:key="drive.id"
>

<td>{{drive.job_title}}</td>

<td>{{drive.branch}}</td>

<td>{{drive.min_cgpa}}</td>

<td>{{drive.status}}</td>

<td>

<button @click="handleApprove(drive.id)">

Approve

</button>

<button @click="handleReject(drive.id)">

Reject

</button>

</td>

</tr>

</tbody>

</table>

</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {

getPendingDrives,

approveDrive,

rejectDrive

} from "../../services/adminService"

const drives=ref([])

async function loadDrives(){

try{

const response=await getPendingDrives()

drives.value=response.data

}

catch(error){

console.log(error)

}

}

async function handleApprove(id){

const response=await approveDrive(id)

alert(response.data.message)

loadDrives()

}

async function handleReject(id){

const response=await rejectDrive(id)

alert(response.data.message)

loadDrives()

}

onMounted(()=>{

loadDrives()

})

</script>

<style scoped>

@import "./PendingDrives.css";

</style>