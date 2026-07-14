<template>

<div class="register-page">

<div class="register-card">

<h2>Create Account</h2>

<div class="role-buttons">

<button

:type="button"

:class="{active:role==='student'}"

@click="role='student'"

>

Student

</button>

<button

type="button"

:class="{active:role==='company'}"

@click="role='company'"

>

Company

</button>

</div>

<form @submit.prevent="handleSubmit">

<template v-if="role==='student'">

<input v-model="formData.full_name" placeholder="Full Name">

<input v-model="formData.branch" placeholder="Branch">

<input v-model="formData.graduation_year" placeholder="Graduation Year">

<input v-model="formData.cgpa" placeholder="CGPA">

<input v-model="formData.phone" placeholder="Phone Number">

</template>

<template v-else>

<input v-model="formData.company_name" placeholder="Company Name">

<input v-model="formData.hr_name" placeholder="HR Name">

<input v-model="formData.hr_email" placeholder="HR Email">

<input v-model="formData.website" placeholder="Website">

<textarea v-model="formData.description" placeholder="Company Description"></textarea>

</template>

<input

type="email"

v-model="formData.email"

placeholder="Email"

>

<input

type="password"

v-model="formData.password"

placeholder="Password"

>

<button type="submit">

Register

</button>

</form>

<p>

Already have an account?

<router-link to="/">

Login

</router-link>

</p>

</div>

</div>

</template>

<script setup>

import {ref} from "vue"

import {useRouter} from "vue-router"

import {

registerStudent,

registerCompany

} from "../../services/authService"

const router=useRouter()

const role=ref("student")

const formData=ref({

full_name:"",

branch:"",

graduation_year:"",

cgpa:"",

phone:"",

company_name:"",

hr_name:"",

hr_email:"",

website:"",

description:"",

email:"",

password:""

})

async function handleSubmit(){

try{

if(role.value==="student"){

await registerStudent(formData.value)

alert("Student Registered Successfully")

}

else{

await registerCompany(formData.value)

alert("Company Registration Submitted")

}

router.push("/")

}

catch(error){

alert(error.response?.data?.message || "Registration Failed")

}

}

</script>

<style scoped>

@import "./Register.css";

</style>