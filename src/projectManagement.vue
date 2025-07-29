<template>
  <Header :role="'projectDirector'" class="heading" />
  <div class="project-form">
    <h2>Create New Project 🚀</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Project Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          placeholder="Enter project name"
          required
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          v-model="description"
          id="description"
          placeholder="Describe the project"
          required
        ></textarea>
      </div>

      <button type="submit">Create Project</button>
    </form>

    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>

  <!-- Display all projects -->
  <div class="project-list" v-if="projectStore.projects.length > 0">
    <h2>📋 All Projects</h2>
    <ul>
      <li v-for="project in projectStore.projects" :key="project.id" class="project-item">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <small>Project ID: {{ project.id }}</small>

        <!-- Show assigned teams -->
        <div v-if="getTeamsAssignedToProject(project.id).length">
          <strong>Assigned Teams:</strong>
          <ul>
            <li
              v-for="team in getTeamsAssignedToProject(project.id)"
              :key="team.id"
            >
              Team {{ team.id }} (Lead: {{ team.teamLead?.name || 'N/A' }})
            </li>
          </ul>
        </div>
        <div v-else>
          <em>No team assigned</em>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/header.vue'
import { useProjectStore } from './store/projectStore'
import { useTeamStore } from './store/teamStore'

const name = ref('')
const description = ref('')
const successMessage = ref('')
const projectStore = useProjectStore()
const teamStore = useTeamStore()

function handleSubmit() {
  if (!name.value.trim() || !description.value.trim()) {
    successMessage.value = '❌ Please fill in all fields.'
    return
  }

  // Add the project via store
  projectStore.addProject(name.value, description.value)

  successMessage.value = '✅ Project created successfully!'
  name.value = ''
  description.value = ''
}

// Helper to get teams assigned to a project
function getTeamsAssignedToProject(projectId) {
  return teamStore.teams.filter(team =>
    team.assignedProjects?.includes(projectId)
  )
}
</script>

<style scoped>
.project-form {
  position: absolute;
  width: 500px;
  margin: 0 auto;
  background: #fdf6e3;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 10px;
  margin-top: 50px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  background-color: #0077cc;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.success {
  margin-top: 10px;
  color: green;
  font-weight: bold;
}

.project-list {
  position: absolute;
  width: 700px;
  margin: 20px auto;
  background: #e3f2fd;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 700px;
  margin-top: 20px;
  height:75vh;
}

.project-item {
  background: #ffffff;
  padding: 10px 15px;
  margin-bottom: 10px;
  border-left: 5px solid #0077cc;
  border-radius: 6px;
}

.project-item h3 {
  margin: 0;
  font-size: 18px;
}

.project-item p {
  margin: 5px 0;
}
</style>
