<template>
  <Header :role="'developer'" />
  <div class="my-sprints">
    <h2>🚩 My Assigned Sprints & Tasks</h2>
    <div v-if="assignedSprints.length">
      <div v-for="sprintInfo in assignedSprints" :key="sprintInfo.sprint.id" class="sprint-section">
        <h3>
          {{ sprintInfo.project.name }} — {{ sprintInfo.sprint.name }}
        </h3>
        <table>
          <thead>
            <tr>
              <th>Task</th>
              <th>Description</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in sprintInfo.sprint.tasks.filter(t => t.status !== 'done' && !t.completed)" :key="task.id">
              <td>{{ task.title }}</td>
              <td>{{ task.description }}</td>
              <td>
                <span class="status-pending">Pending</span>
              </td>
              <td>
                <template v-if="!isTaskAssignedToMe(task)">
                  <button class="assign-btn" @click="assignToMe(task)">Assign to Me</button>
                </template>
                <template v-else>
                  <button
                    class="complete-btn"
                    @click="markComplete(task)"
                  >
                    Mark Complete
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>
      <p>No sprints assigned to you.</p>
    </div>
  </div>
</template>

<script setup>
import Header from './components/header.vue'
import { computed } from 'vue'
import { useUserStore } from './store/userStore'
import { useProjectStore } from './store/projectStore'
import { useTeamStore } from './store/teamStore'

const userStore = useUserStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()

const currentUser = computed(() =>
  userStore.users.find(u => u.email === userStore.currentEmail)
)
const currentEmail = computed(() => userStore.currentEmail)

// Find the team the developer belongs to
const currentTeam = computed(() =>
  teamStore.teams.find(t =>
    Array.isArray(t.developers) && t.developers.some(dev => dev?.email === currentUser.value?.email)
  )
)

// Find all sprints assigned to this developer via sprintAssignments
const assignedSprints = computed(() => {
  if (!currentUser.value || !currentTeam.value) return []
  const sprintAssignments = Array.isArray(currentTeam.value.sprintAssignments)
    ? currentTeam.value.sprintAssignments
    : []
  return sprintAssignments
    .filter(a => Array.isArray(a.developerIds) && a.developerIds.includes(currentUser.value.id))
    .map(a => {
      const project = projectStore.projects.find(p => p.id === a.projectId)
      const sprint = project?.sprints?.find(s => s.id === a.sprintId)
      return { project, sprint }
    })
    .filter(a => a.sprint && a.project)
})

// Check if the task is assigned to the current user (by email)
function isTaskAssignedToMe(task) {
  if (!task.assignedTo) return false
  if (Array.isArray(task.assignedTo)) {
    return task.assignedTo.includes(currentEmail.value)
  }
  return task.assignedTo === currentEmail.value
}

// Assign the task to the current user (by email)
function assignToMe(task) {
  // Find the actual task in the store and update assignedTo
  for (const sprintInfo of assignedSprints.value) {
    const storeProject = projectStore.projects.find(p => p.id === sprintInfo.project.id)
    const storeSprint = storeProject?.sprints?.find(s => s.id === sprintInfo.sprint.id)
    const storeTask = storeSprint?.tasks?.find(t => t.id === task.id)
    if (storeTask) {
      if (!storeTask.assignedTo) {
        storeTask.assignedTo = [currentEmail.value]
      } else if (Array.isArray(storeTask.assignedTo)) {
        if (!storeTask.assignedTo.includes(currentEmail.value)) {
          storeTask.assignedTo.push(currentEmail.value)
        }
      } else {
        storeTask.assignedTo = [storeTask.assignedTo, currentEmail.value]
      }
      if (typeof projectStore.saveToLocalStorage === 'function') {
        projectStore.saveToLocalStorage()
      }
      break
    }
  }
}

// Mark the task as complete
function markComplete(task) {
  // Find the actual task in the store and update completed
  for (const sprintInfo of assignedSprints.value) {
    const storeProject = projectStore.projects.find(p => p.id === sprintInfo.project.id)
    const storeSprint = storeProject?.sprints?.find(s => s.id === sprintInfo.sprint.id)
    const storeTask = storeSprint?.tasks?.find(t => t.id === task.id)
    if (storeTask && isTaskAssignedToMe(storeTask)) {
      storeTask.completed = true
      storeTask.status = 'done'
      if (typeof projectStore.saveToLocalStorage === 'function') {
        projectStore.saveToLocalStorage()
      }
      break
    }
  }
}
</script>

<style scoped>
.my-sprints {
  padding: 20px;
  background-color: white;
  max-width: 900px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.sprint-section {
  margin-bottom: 30px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #fff;
}
th, td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}
.status-complete {
  color: #4caf50;
  font-weight: bold;
}
.status-pending {
  color: #d84315;
  font-weight: bold;
}
.assign-btn, .complete-btn {
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  margin-right: 6px;
  transition: background 0.2s;
}
.assign-btn:hover, .complete-btn:hover {
  background: #1769aa;
}
.complete-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>