<template>

<div class="resume-page">

<h1>Upload Resume</h1>

<div class="resume-card">

<form @submit.prevent="uploadResume">

<input

type="text"

placeholder="Paste Google Drive / OneDrive Resume Link"

v-model="resumeUrl"

/>

<button>

Upload Resume

</button>

</form>

</div>

</div>

</template>

<script setup>

import {ref} from "vue"

import {
updateResume
}
from "../../services/studentService"

const resumeUrl=ref("")

async function uploadResume(){

if(!resumeUrl.value){

alert("Please enter resume link")

return

}

try{

const response=await updateResume(
resumeUrl.value
)

alert(response.data.message)

}

catch(error){

console.log(error)

}

}

</script>

<style scoped>

@import "./Resume.css";

</style>