<template>
  <Header :role="'projectDirector'" class="heading" />
  <div class="project-form">
    <h2>Create New Project 🚀</h2>

    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="name">Project Name</label>
        <input
          v-model="name"
          type="text"
          id="name"
          placeholder="Enter project name"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          v-model="description"
          id="description"
          placeholder="Enter project description"
        ></textarea>
      </div>

      <button type="submit">Create Project</button>
    </form>

    <p class="success-message">{{ successMessage }}</p>
  </div>

  <div class="project-list">
    <h2>All Projects 📋</h2>
    <ul>
      <li v-for="project in projects" :key="project._id || project.id" class="project-item">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <p><strong>Progress:</strong> {{ project.progress }}%</p>
        <p><strong>Sprints:</strong> {{ project.sprints?.length || 0 }}</p>
        <small><strong>ID:</strong> {{ project._id }}</small>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/header.vue'

const name = ref('')
const description = ref('')
const successMessage = ref('')
const projects = ref([])

// Fetch all projects
async function fetchData() {
  const apiUrl = import.meta.env.VITE_API_URL; 
  console.log('api', apiUrl)
  try {
    const res = await fetch(`${apiUrl}/api/projects`)
    if (res.ok) {
      const data = await res.json()
      projects.value = Array.isArray(data) ? data : []
    } else {
      projects.value = []
    }
  } catch (error) {
    console.error('❌ Error fetching projects:', error)
    projects.value = []
  }
}

fetchData()

// Create new project
async function handleSubmit() {
  if (!name.value.trim() || !description.value.trim()) {
    successMessage.value = '❌ Please fill in all fields.'
    return
  }

  try {
    const res = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        description: description.value
        // assignedTeam, sprints, and progress will default via schema
      })
    })

    if (res.ok) {
      successMessage.value = '✅ Project created successfully!'
      name.value = ''
      description.value = ''
      await fetchData()
    } else {
      const err = await res.json()
      console.error('❌ Server responded with:', err)
      successMessage.value = '❌ Failed to create project.'
    }
  } catch (err) {
    console.error('❌ Error creating project:', err)
    successMessage.value = '❌ Failed to create project.'
  }
}
</script>

<style scoped>
.project-form,
.project-list {
  margin: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 1rem;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
}

.success-message {
  margin-top: 1rem;
  font-weight: bold;
}

.project-item {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #ffffff;
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
