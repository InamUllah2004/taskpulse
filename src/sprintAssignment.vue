<template>
  <Header :role="'teamLead'" />
  <div class="sprint-assignment">
    <h2>🧩 Assign Developers to Sprints</h2>

    <div v-if="teamProjects.length">
      <h3>Select a Project:</h3>
      <ul>
        <li v-for="project in teamProjects" :key="project.id">
          <button @click="selectProject(project)">
            {{ project.name }}
          </button>
        </li>
      </ul>
    </div>
    <div v-else>No projects assigned to your team.</div>

    <div v-if="selectedProject">
      <h3>Sprints for {{ selectedProject.name }}</h3>
      <table>
        <thead>
          <tr>
            <th>Sprint</th>
            <th>Assign Developer(s)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sprint in selectedProject.sprints" :key="sprint.id">
            <td>{{ sprint.name }}</td>
            <td>
              <select
                multiple
                v-model="selectedDevelopers[sprint.id]"
                class="multi-select"
              >
                <option
                  v-for="dev in teamDevelopers"
                  :key="dev.id"
                  :value="dev.id"
                >
                  {{ dev.name }}
                </option>
              </select>
            </td>
            <td>
              <button
                @click="assignSprint(sprint.id)"
                :disabled="!selectedDevelopers[sprint.id]?.length"
                class="assign-btn"
              >
                Assign
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from './store/userStore'
import { useTeamStore } from './store/teamStore'
import { useProjectStore } from './store/projectStore'
import Header from './components/header.vue'

const userStore = useUserStore()
const teamStore = useTeamStore()
const projectStore = useProjectStore()

const currentUser = computed(() =>
  userStore.users.find(u => u.email === userStore.currentEmail)
)

const currentTeam = computed(() =>
  teamStore.teams.find(t => t.teamLead?.email === currentUser.value?.email)
)

const teamDevelopers = computed(() =>
  currentTeam.value?.developers?.filter(dev => dev !== null) || []
)

const teamProjects = computed(() =>
  projectStore.projects.filter(p =>
    currentTeam.value?.assignedProjects?.includes(p.id)
  )
)

const selectedProject = ref(null)
const selectedDevelopers = ref({})

const selectProject = (project) => {
  selectedProject.value = project
  selectedDevelopers.value = {}

  let sprintAssignments = currentTeam.value?.sprintAssignments
  if (!Array.isArray(sprintAssignments)) {
    sprintAssignments = []
  }
  for (const sprint of project.sprints) {
    const match = sprintAssignments.find(
      a => a.projectId === project.id && a.sprintId === sprint.id
    )
    if (match && Array.isArray(match.developerIds)) {
      selectedDevelopers.value[sprint.id] = [...match.developerIds]
    } else {
      selectedDevelopers.value[sprint.id] = []
    }
  }
}

const assignSprint = (sprintId) => {
  const developerIds = selectedDevelopers.value[sprintId]
  if (!Array.isArray(developerIds) || developerIds.length === 0) return

  teamStore.assignSprintToDevelopers(
    currentTeam.value.id,
    selectedProject.value.id,
    sprintId,
    developerIds
  )
  alert('Sprint assigned successfully!')
}
</script>

<style scoped>
.sprint-assignment {
  padding: 20px;
  background-color: white;
  max-width: 800px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
  margin-bottom: 10px;
}

ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

li button {
  background-color: #4caf50;
  color: white;
  padding: 6px 12px;
  border: none;
  margin-bottom: 5px;
  border-radius: 5px;
  cursor: pointer;
}

li button:hover {
  background-color: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th,
td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

.multi-select {
  width: 100%;
  height: 80px;
}

.assign-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 12px;
  margin-top: 5px;
  border-radius: 5px;
  cursor: pointer;
}

.assign-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
