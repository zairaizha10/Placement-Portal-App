<template>
  <div class="drives-page">
    <h1>Placement Drives</h1>

    <input
      type="text"
      placeholder="Search Job Title..."
      v-model="search"
    />

    <div class="drive-list">
      <div
        class="drive-card"
        v-for="drive in filteredDrives"
        :key="drive.id"
      >
        <h2>{{ drive.job_title }}</h2>

        <p><strong>Branch:</strong> {{ drive.branch }}</p>

        <p><strong>Package:</strong> {{ drive.package }}</p>

        <p><strong>Location:</strong> {{ drive.location }}</p>

        <p><strong>Minimum CGPA:</strong> {{ drive.min_cgpa }}</p>

        <button @click="handleApply(drive.id)">
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  getAvailableDrives,
  applyDrive
} from "@/services/studentService";

const drives = ref([]);
const search = ref("");

const loadDrives = async () => {
  try {
    const response = await getAvailableDrives();
    drives.value = response.data;
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  loadDrives();
});

const handleApply = async (driveId) => {
  try {
    const response = await applyDrive(driveId);
    alert(response.data.message);
  } catch (error) {
    alert(error.response?.data?.message || "Application Failed");
  }
};

const filteredDrives = computed(() => {
  return drives.value.filter((drive) =>
    drive.job_title
      ?.toLowerCase()
      .includes(search.value.toLowerCase())
  );
});
</script>

<style scoped>

@import "./ViewDrives.css";

</style>

