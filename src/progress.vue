<template>
  <Header :role="'teamLead'" />
  <div class="overview">
    <h2>📝 Sprint Assignments Overview</h2>
    <div v-if="teamProjects.length">
      <div v-for="project in teamProjects" :key="project.id" class="project-section">
        <h3>{{ project.name }}</h3>
        <table>
          <thead>
            <tr>
              <th>Sprint</th>
              <th>Assigned Developers</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sprint in project.sprints" :key="sprint.id">
              <td>{{ sprint.name }}</td>
              <td>
                <span v-if="getAssignedDevelopers(project.id, sprint.id).length">
                  <span v-for="dev in getAssignedDevelopers(project.id, sprint.id)" :key="dev.id" class="dev-pill">
                    {{ dev.name }}
                  </span>
                </span>
                <span v-else style="color: #888;">No developers assigned</span>
              </td>
              <td>
                <span v-if="sprint.tasks && sprint.tasks.length">
                  <span class="progress-bar-container">
                    <span class="progress-bar" :style="{width: sprintCompletion(sprint) + '%'}"></span>
                  </span>
                  <span class="progress-label">{{ sprintCompletion(sprint) }}%</span>
                </span>
                <span v-else style="color: #888;">No tasks</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p>No projects assigned to your team.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
// Calculate sprint completion percentage
function sprintCompletion(sprint) {
  if (!sprint.tasks || !sprint.tasks.length) return 0
  const completed = sprint.tasks.filter(t => t.completed).length
  return Math.round((completed / sprint.tasks.length) * 100)
}
const teamProjects = computed(() =>
  projectStore.projects.filter(p =>
    currentTeam.value?.assignedProjects?.includes(p.id)
  )
)

const getAssignedDevelopers = (projectId, sprintId) => {
  let sprintAssignments = currentTeam.value?.sprintAssignments
  if (!Array.isArray(sprintAssignments)) sprintAssignments = []
  const assignment = sprintAssignments.find(
    a => a.projectId === projectId && a.sprintId === sprintId
  )
  if (!assignment || !Array.isArray(assignment.developerIds)) return []
  // Map developerIds to developer objects
  return assignment.developerIds
    .map(id => teamDevelopers.value.find(dev => dev.id === id))
    .filter(Boolean)
}
</script>

<style scoped>
.overview {
  padding: 20px;
  background-color: white;
  max-width: 900px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.project-section {
  margin-bottom: 30px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}
.dev-pill {
  display: inline-block;
  background: #2196f3;
  color: white;
  border-radius: 12px;
  padding: 2px 10px;
  margin: 2px 4px 2px 0;
  font-size: 0.95em;
}

.progress-bar-container {
  display: inline-block;
  width: 70px;
  height: 10px;
  background: #eee;
  border-radius: 6px;
  margin-right: 8px;
  vertical-align: middle;
  overflow: hidden;
}
.progress-bar {
  display: inline-block;
  height: 100%;
  background: #4caf50;
  border-radius: 6px 0 0 6px;
  transition: width 0.3s;
}
.progress-label {
  font-size: 0.98em;
  color: #333;
  vertical-align: middle;
}
</style>