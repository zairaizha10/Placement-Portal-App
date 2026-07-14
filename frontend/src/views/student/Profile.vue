<template>

<div
class="profile-page"
v-if="student"
>

<h1>My Profile</h1>

<div class="profile-card">

<p>

<strong>Full Name:</strong>

{{student.full_name}}

</p>

<p>

<strong>Email:</strong>

{{student.email}}

</p>

<p>

<strong>Branch:</strong>

{{student.branch}}

</p>

<p>

<strong>CGPA:</strong>

{{student.cgpa}}

</p>

<p>

<strong>Graduation Year:</strong>

{{student.graduation_year}}

</p>

<p>

<strong>Phone:</strong>

{{student.phone}}

</p>

<p>

<strong>Placement Status:</strong>

{{student.placement_status}}

</p>

<p>

<strong>Resume:</strong>

<a
v-if="student.resume"
:href="student.resume"
target="_blank"
>

View Resume

</a>

<span v-else>

Not Uploaded

</span>

</p>

</div>

</div>

</template>

<script setup>

import {ref,onMounted} from "vue"

import {
getStudentProfile
}
from "../../services/studentService"

const student=ref(null)

onMounted(async()=>{

    try{
        const response=await getStudentProfile()
        student.value=response.data
    }
    catch(error){
        console.log(error)
    }
})

</script>
<style scoped>
@import "./Profile.css";
</style>