<template>

<div class="drives-page">

    <h1>My Placement Drives</h1>

    <h3 v-if="drives.length===0">

        No Placement Drives Found

    </h3>

    <div
        v-else
        class="drive-list"
    >

        <div
            class="drive-card"
            v-for="drive in drives"
            :key="drive.id"
        >

            <h2>{{ drive.job_title }}</h2>

            <p>

                <strong>Branch:</strong>

                {{ drive.branch }}

            </p>

            <p>

                <strong>CGPA:</strong>

                {{ drive.min_cgpa }}

            </p>

            <p>

                <strong>Package:</strong>

                {{ drive.package }}

            </p>

            <p>

                <strong>Location:</strong>

                {{ drive.location }}

            </p>

            <p>

                <strong>Status:</strong>

                {{ drive.status }}

            </p>

            <p>

                <strong>Drive ID:</strong>

                {{ drive.id }}

            </p>

            <button
                @click="viewApplicants(drive.id)"
            >

                View Applicants

            </button>

        </div>

    </div>

</div>

</template>

<script setup>

import { ref,onMounted } from "vue"

import { useRouter } from "vue-router"

import { getMyDrives } from "../../services/companyService"

const router=useRouter()

const drives=ref([])

onMounted(async()=>{

    try{

        const response=await getMyDrives()

        drives.value=response.data

    }

    catch(error){

        console.log(error)

    }

})

function viewApplicants(id){

    router.push(`/company/applications/${id}`)

}

</script>

<style scoped>

@import "./MyDrives.css";

</style>