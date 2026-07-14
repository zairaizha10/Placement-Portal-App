<template>

<div class="search-page">

    <h1>Search Students</h1>

    <input
        type="text"
        placeholder="Search Student..."
        v-model="keyword"
    />

    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Branch</th>
                <th>CGPA</th>
                <th>Graduation</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="student in students"
                :key="student.id"
            >
                <td>{{ student.name }}</td>
                <td>{{ student.branch }}</td>
                <td>{{ student.cgpa }}</td>
                <td>{{ student.graduation_year }}</td>
                <td>{{ student.placement_status }}</td>
            </tr>
            <tr v-if="students.length === 0">
                <td colspan="5">
                    No Students Found
                </td>
            </tr>
        </tbody>
    </table>
</div>
</template>

<script setup>

import { ref, watch, onMounted } from "vue";

import { searchStudents } from "../../services/adminService";

const keyword = ref("");

const students = ref([]);

async function loadStudents() {

    try {
        const response = await searchStudents(keyword.value);
        students.value = response.data;
    }

    catch (error) {
        console.log(error);
    }
}

onMounted(() => {

    loadStudents();

});

watch(keyword, () => {
    loadStudents();
});

</script>

<style scoped>

@import "./SearchStudents.css";

</style>