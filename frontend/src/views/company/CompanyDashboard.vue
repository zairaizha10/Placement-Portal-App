<template>

<div class="dashboard">

    <aside class="sidebar">

        <h2>Placement Portal</h2>

        <ul>
            <li>
                <RouterLink to="/company/dashboard">
                    Dashboard
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/company/create-drive">
                    Create Drive
                </RouterLink>
            </li>
            <li>
                <RouterLink to="/company/my-drives">
                    My Drives
                </RouterLink>
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
        <h1>Company Dashboard</h1>
        <p>Welcome Company 👋</p>
        <div class="cards">

            <div class="card">

                <h3>Company</h3>

                <h2>{{dashboard.company}}</h2>

            </div>

            <div class="card">

                <h3>Total Drives</h3>

                <h2>{{dashboard.total_drives}}</h2>

            </div>

            <div class="card">

                <h3>Total Applications</h3>

                <h2>{{dashboard.total_applications}}</h2>

            </div>
            <div class="card">
                <h3>Pending Approval</h3>
                <h2>{{dashboard.pending_drives}}</h2>
            </div>
        </div>
    </main>
</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {getCompanyDashboard}
from "../../services/companyService"

const router=useRouter()

const dashboard=ref({

company:"",

total_drives:0,

total_applications:0,

pending_drives:0

})

onMounted(async()=>{

try{

const response=await getCompanyDashboard()

dashboard.value=response.data

}

catch(error){

console.log(error)

}

})

function logout(){

localStorage.removeItem("token")

localStorage.removeItem("role")

router.push("/")

}

</script>

<style scoped>

@import "./CompanyDashboard.css";

</style>