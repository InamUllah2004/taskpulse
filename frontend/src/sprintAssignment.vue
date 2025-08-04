<template>
  <Header :role="'teamLead'" />
  <div class="container">
    <h2 class="heading">Sprint Assignment</h2>

    <div class="project-selection">
      <h3>Select Project:</h3>
      <div v-if="teamProjects.length">
        <button
          v-for="project in teamProjects"
          :key="project._id"
          class="project-button"
          @click="selectProject(project)"
        >
          {{ project.name }}
        </button>
      </div>
      <p v-else>No assigned projects found.</p>
    </div>

    <div v-if="selectedProject" class="sprint-assignment">
      <h3>Sprints in {{ selectedProject.name }}</h3>
      <div
        v-for="sprint in selectedProject.sprints"
        :key="sprint._id"
        class="sprint-card"
      >
        <h4>{{ sprint.name }}</h4>
        <label>Select Developers:</label>
        <select v-model="selectedDevelopers[sprint._id]" multiple>
          <option
            v-for="dev in teamDevelopers"
            :key="dev._id"
            :value="dev._id"
          >
            {{ dev.email }}
          </option>
        </select>
        <button @click="assignSprint(sprint._id)">Assign</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Header from './components/header.vue'
import { useUserContext } from './store/userContext'

const users = ref([])
const teams = ref([])
const projects = ref([])

const myTeam = ref(null)
const selectedProject = ref(null)
const selectedDevelopers = ref({})
const { currentEmail } = useUserContext()

if (!currentEmail.value) {
  const stored = localStorage.getItem('currentEmail')
  if (stored) currentEmail.value = stored
}

onMounted(async () => {
  try {
    const [userRes, teamRes, projectRes] = await Promise.all([
      fetch('http://localhost:3000/api/users'),
      fetch('http://localhost:3000/api/teams'),
      fetch('http://localhost:3000/api/projects')
    ])

    users.value = userRes.ok ? await userRes.json() : []
    teams.value = teamRes.ok ? await teamRes.json() : []
    projects.value = projectRes.ok ? await projectRes.json() : []

    const email = localStorage.getItem('currentEmail')
    const team = teams.value.find(t => t.teamLead?.email === email)

    if (team) {
      myTeam.value = team
      alert(`Welcome, ${team.teamLead.name}!`)
    } else {
      alert('You are not part of any team.')
    }
  } catch (e) {
    console.error('Data fetch error:', e)
    alert('Failed to load data.')
  }
})

const teamDevelopers = computed(() => {
  if (!myTeam.value?.developers) return []
  return users.value.filter(user =>
    myTeam.value.developers.some(dev =>
      typeof dev === 'object' ? dev._id === user._id : dev === user._id
    )
  )
})

const teamProjects = computed(() => {
  return Array.isArray(myTeam.value?.assignedProjects)
    ? myTeam.value.assignedProjects
    : []
})

const selectProject = (project) => {
  selectedProject.value = project
  selectedDevelopers.value = {}

  const sprintAssignments = myTeam.value?.sprintAssignments || []
  for (const sprint of project.sprints || []) {
    const assignment = sprintAssignments.find(
      a =>
        (a.projectId === project._id || a.projectId == project._id) &&
        (a.sprintId === sprint._id || a.sprintId == sprint._id)
    )
    selectedDevelopers.value[sprint._id] = assignment?.developerIds || []
  }
}

const assignSprint = async (sprintId) => {
  const developerIds = selectedDevelopers.value[sprintId]
  if (!developerIds?.length) {
    alert('Please select at least one developer')
    return
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/teams/${myTeam.value._id}/assign-sprint`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.value._id,
          sprintId,
          developerIds
        })
      }
    )

    if (!res.ok) throw new Error('Sprint assignment failed')
    alert('Sprint assigned successfully')
  } catch (e) {
    alert('Failed to assign sprint: ' + e.message)
  }
}
</script>

<style scoped>
.container {
  max-width: 100%;
  padding: 2rem;
  font-family: Arial, sans-serif;
  background-color: white;
}

.heading {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

.project-selection,
.sprint-assignment {
  margin-top: 2rem;
}

.project-button {
  margin: 0.25rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.project-button:hover {
  background-color: #0056b3;
}

.sprint-card {
  background: #f1f1f1;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

select {
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  border: none;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #1e7e34;
}
</style>
