<template>

<div class="drive-page">

    <h1>Create Placement Drive</h1>

    <form
        class="drive-form"
        @submit.prevent="handleSubmit"
    >

        <input
            type="text"
            v-model="form.job_title"
            placeholder="Job Title"
        >

        <input
            type="text"
            v-model="form.branch"
            placeholder="Eligible Branch"
        >

        <input
            type="number"
            v-model="form.min_cgpa"
            placeholder="Minimum CGPA"
        >

        <input
            type="number"
            v-model="form.graduation_year"
            placeholder="Graduation Year"
        >

        <input
            type="text"
            v-model="form.package"
            placeholder="Package (LPA)"
        >

        <input
            type="text"
            v-model="form.location"
            placeholder="Location"
        >

        <input
            type="text"
            v-model="form.job_description"
            placeholder="Job Description"
        >

        <input
            type="date"
            v-model="form.deadline"
        >

        <button type="submit">

            Create Drive

        </button>

    </form>

</div>

</template>

<script setup>

import { reactive } from "vue"

import { createDrive } from "../../services/companyService"

const form = reactive({

    job_title: "",

    job_description: "",

    branch: "",

    min_cgpa: "",

    graduation_year: "",

    package: "",

    location: "",

    deadline: ""

})

async function handleSubmit(){

    try{

        const response = await createDrive(form)

        alert(response.data.message)

    }

    catch(error){

        alert(error.response?.data?.message || "Failed")

    }

}

</script>

<style scoped>

@import "./CreateDrive.css";

</style>