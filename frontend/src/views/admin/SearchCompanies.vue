<template>

<div class="search-page">

    <h1>Search Companies</h1>
    <input
        type="text"
        placeholder="Search Company..."
        v-model="keyword"
    />
    <table>
        <thead>
            <tr>
                <th>Company</th>
                <th>Website</th>
                <th>Status</th>
                <th>Blacklisted</th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="company in companies"
                :key="company.id"
            >
                <td>{{ company.company_name }}</td>
                <td>{{ company.website }}</td>
                <td>{{ company.approval_status }}</td>
                <td>

                    {{ company.blacklisted ? "Yes" : "No" }}

                </td>
            </tr>
            <tr v-if="companies.length === 0">

                <td colspan="4">
                    No Companies Found
                </td>

            </tr>
        </tbody>
    </table>
</div>

</template>

<script setup>

import { ref, watch, onMounted } from "vue";

import { searchCompanies } from "../../services/adminService";

const keyword = ref("");

const companies = ref([]);

async function loadCompanies() {

    try {
        const response = await searchCompanies(keyword.value);

        companies.value = response.data;
    }

    catch (error) {
        console.log(error);
    }

}


onMounted(() => {

    loadCompanies();

});


watch(keyword, () => {

    loadCompanies();

});

</script>

<style scoped>

@import "./SearchCompanies.css";

</style>