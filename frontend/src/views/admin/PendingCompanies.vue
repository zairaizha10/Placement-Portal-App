<template>

<div class="pending-page">

<h1>Pending Companies</h1>

<table>

<thead>

<tr>

<th>Company</th>

<th>Email</th>

<th>Status</th>

<th>Action</th>

</tr>

</thead>

<tbody>

<tr
v-for="company in companies"
:key="company.id"
>

<td>{{company.company_name}}</td>

<td>{{company.hr_email}}</td>

<td>{{company.status}}</td>

<td>

<button @click="handleApprove(company.id)">

Approve

</button>

<button @click="handleReject(company.id)">

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

import {useRouter} from "vue-router"

import {

getPendingCompanies,

approveCompany,

rejectCompany

} from "../../services/adminService"

const router=useRouter()

const companies=ref([])

async function loadCompanies(){

try{

const response=await getPendingCompanies()

companies.value=response.data

}

catch(error){

console.log(error)

}

}

async function handleApprove(id){

const response=await approveCompany(id)

alert(response.data.message)

loadCompanies()

}

async function handleReject(id){

const response=await rejectCompany(id)

alert(response.data.message)

loadCompanies()

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