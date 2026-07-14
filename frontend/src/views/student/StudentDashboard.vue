<template>
<div class="dashboard">

    <aside class="sidebar">

        <h2>Placement Portal</h2>

        <ul>

            <li>Dashboard</li>

            <li>
                <router-link to="/student/drives">
                    View Drives
                </router-link>
            </li>

            <li>
                <router-link to="/student/applications">
                    My Applications
                </router-link>
            </li>

            <li>
                <router-link to="/student/profile">
                    Profile
                </router-link>
            </li>

            <li>
                <router-link to="/student/resume">
                    Resume
                </router-link>
            </li>

            <li>

                <button
                    class="logout-btn"
                    @click="logout"
                >

                    Logout

                </button>

            </li>

        </ul>

    </aside>

    <main class="content">

        <h1>Student Dashboard</h1>

        <p>

            Welcome Back 👋 {{ profile?.full_name }}

        </p>

        <div class="cards">

            <div class="card">

                <h3>Total Applications</h3>

                <h2>{{ applications.length }}</h2>

            </div>

            <div class="card">

                <h3>Available Drives</h3>

                <h2>{{ drives.length }}</h2>

            </div>

            <div class="card">

                <h3>Placement Status</h3>

                <h2>

                    {{ profile?.placement_status }}

                </h2>

            </div>

        </div>

    </main>

</div>
</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {

getStudentProfile,

getMyApplications,

getAvailableDrives

} from "../../services/studentService"

const router=useRouter()

const profile=ref(null)

const applications=ref([])

const drives=ref([])

async function loadDashboard(){

    try{

        const profileRes=await getStudentProfile()

        profile.value=profileRes.data

        const appRes=await getMyApplications()

        applications.value=appRes.data

        const driveRes=await getAvailableDrives()

        drives.value=driveRes.data

    }

    catch(error){

        console.log(error)

    }

}

function logout(){

    localStorage.removeItem("token")

    localStorage.removeItem("role")

    router.push("/")

}

onMounted(loadDashboard)

</script>

<style scoped>

@import "./StudentDashboard.css";

</style>