<template>

<div class="analytics-page">

    <h1>Placement Analytics</h1>

    <div class="analytics-cards">

        <div class="card">

            <h3>Total Students</h3>

            <h2>{{ analytics.total_students }}</h2>

        </div>

        <div class="card">

            <h3>Total Companies</h3>
            <h2>{{ analytics.total_companies }}</h2>

        </div>

        <div class="card">

            <h3>Total Drives</h3>
            <h2>{{ analytics.total_drives }}</h2>

        </div>

        <div class="card">

            <h3>Total Applications</h3>
            <h2>{{ analytics.total_applications }}</h2>

        </div>

        <div
            class="card"
            @click="router.push('/admin/approved-companies')"
        >

            <h3>Approved Companies</h3>
            <h2>{{ analytics.approved_companies }}</h2>

        </div>

        <div
            class="card"
            @click="router.push('/admin/approved-drives')"
        >

            <h3>Approved Drives</h3>
            <h2>{{ analytics.approved_drives }}</h2>

        </div>

        <div class="card">

            <h3>Selected Students</h3>
            <h2>{{ analytics.selected_students }}</h2>

        </div>

    </div>

</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {getAnalytics} from "../../services/adminService"

const router=useRouter()

const analytics=ref({

total_students:0,

total_companies:0,

total_drives:0,

approved_companies:0,

approved_drives:0,

total_applications:0,

selected_students:0

})

async function loadAnalytics(){

try{

const response=await getAnalytics()

analytics.value=response.data

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

loadAnalytics()

})

</script>

<style scoped>

@import "./Analytics.css";

</style>