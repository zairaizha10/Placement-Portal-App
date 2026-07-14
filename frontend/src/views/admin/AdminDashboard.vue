<template>

<div class="dashboard">

    <aside class="sidebar">

        <h2>Placement Portal</h2>

        <ul>

            <li><router-link to="/admin/dashboard">Dashboard</router-link></li>

            <li><router-link to="/admin/pending-companies">Pending Companies</router-link></li>

            <li><router-link to="/admin/pending-drives">Pending Drives</router-link></li>

            <li><router-link to="/admin/applications">Applications</router-link></li>

            <li><router-link to="/admin/analytics">Analytics</router-link></li>

            <li><router-link to="/admin/search-students">Search Students</router-link></li>

            <li><router-link to="/admin/search-companies">Search Companies</router-link></li>

            <li>

                <button
                    class="logout-btn"
                    @click="handleLogout"
                >
                    Logout
                </button>
            </li>
        </ul>
    </aside>
    <main class="content">
        <h1>Admin Dashboard</h1>
        <p>Welcome Admin 👋</p>
        <div class="cards">

            <div class="card">

                <h3>Total Students</h3>

                <h2>{{ dashboard.students }}</h2>

            </div>

            <div class="card">

                <h3>Total Companies</h3>
                <h2>{{ dashboard.companies }}</h2>

            </div>

            <div class="card">

                <h3>Pending Companies</h3>
                <h2>{{ dashboard.pending_companies }}</h2>

            </div>
            <div class="card">

                <h3>Pending Drives</h3>
                <h2>{{ dashboard.pending_drives }}</h2>

            </div>
        </div>
    </main>

</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {getDashboard} from "../../services/adminService"

const router=useRouter()

const dashboard=ref({

students:0,

companies:0,

pending_companies:0,

pending_drives:0

})

function handleLogout(){

localStorage.removeItem("token")
localStorage.removeItem("role")

router.push("/")

}

onMounted(async()=>{

if(!localStorage.getItem("token")){

router.push("/")

return

}

try{

const response=await getDashboard()

dashboard.value=response.data

}

catch(error){

console.log(error)

}

})

</script>

<style scoped>

@import "./AdminDashboard.css";

</style>