<template>

<div class="pending-page">

    <h1>Approved Companies</h1>

    <table>
        <thead>
            <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="company in companies"
                :key="company.id"
            >
                <td>{{ company.company_name }}</td>
                <td>{{ company.hr_email }}</td>
                <td>{{ company.status }}</td>
            </tr>
        </tbody>
    </table>
</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {useRouter} from "vue-router"

import {getApprovedCompanies} from "../../services/adminService"

const router=useRouter()

const companies=ref([])

async function loadCompanies(){

try{

const response=await getApprovedCompanies()

companies.value=response.data

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

loadCompanies()

})

</script>

<style scoped>

@import "./PendingCompanies.css";

</style>