<template>
  <header class="header">
    <nav class="nav">
      <!-- Project Director Links -->
      <template v-if="role === 'projectDirector'">
        <a @click="navigateTo('/dash')">Home</a>
        <a @click="navigateTo('/project-management')">New Project</a>
        <a @click="navigateTo('/sprint-management')">Sprint Management</a>
        <a @click="navigateTo('/team-management')">Team Management</a>
        <a @click="navigateTo('/employee-list')">Employee List</a>
      </template>

      <!-- Team Lead Links -->
      <template v-else-if="role === 'teamLead'">
        <a @click="navigateTo('/dashBoard1')">Home</a>
        <a @click="navigateTo('/sprint-assignment')">Assign Sprints</a>
        <a @click="navigateTo('/progress')">Progress Report</a>
      </template>

      <!-- Developer Links -->
      <template v-else-if="role === 'developer'">
        <a @click="navigateTo('/dashBoard2')">Home</a>
        <a @click="navigateTo('/my-sprints')">My Tasks</a>
        <a @click="navigateTo('/submitWork')">Submit Work</a>
      </template>

      <!-- If needed, you can add default content or leave blank -->
    </nav>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps(['role'])

function navigateTo(route) {
  router.push(route)
}
</script>

<style scoped>
.header {
  background-color: #ffcc00; /* Yellow-ish background */
  padding: 20px;
  border-radius: 10px;
  margin: 2px;
}

.nav {
  display: flex;
  justify-content: center;
  gap: 30px;
}

.nav a {
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
