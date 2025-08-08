<template>
  <Header :role="'developer'" />
  <div class="my-sprints">
    <h2>🚩 My Assigned Sprints & Tasks</h2>
    <div v-if="assignedSprints.length">
      <div v-for="sprintInfo in assignedSprints" :key="sprintInfo.sprint._id" class="sprint-section">
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
            <tr v-for="task in sprintInfo.sprint.tasks.filter(t => t.status !== 'done' && !t.completed)"
              :key="task._id">
              <td>{{ task.title }}</td>
              <td>{{ task.description }}</td>
              <td>
                <span class="status-pending">Pending</span>
              </td>
              <td>
                <template v-if="!isTaskAssignedToMe(task)">
                  <button class="assign-btn" @click="assignToMe(task, sprintInfo)">Assign to Me</button>
                </template>
                <template v-else>
                  <button class="complete-btn" @click="markComplete(task, sprintInfo)">Mark Complete</button>
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
import { ref, onMounted } from 'vue'

const currentUser = ref(null)
const assignedSprints = ref([])
const apiUrl = import.meta.env.VITE_API_URL

onMounted(async () => {
  const email = localStorage.getItem('currentEmail')

  const userRes = await fetch(`${apiUrl}/api/users`)
  const users = await userRes.json()
  currentUser.value = users.find(u => u.email === email)

  if (!currentUser.value) {
    alert('❌ Current user not found.')
    return
  }

  const teamsRes = await fetch(`${apiUrl}/api/teams`)
  const teams = await teamsRes.json()
  const currentTeam = teams.find(team =>
    team.developers.some(dev => dev.email === currentUser.value.email)
  )

  if (!currentTeam) {
    alert('⚠️ No team found for this user.')
    return
  }

  const projectsRes = await fetch(`${apiUrl}/api/projects`)
  const projects = await projectsRes.json()

  const assignments = currentTeam.sprintAssignments.filter(assign =>
    assign.developerIds.includes(currentUser.value._id)
  )

  for (const assign of assignments) {
    const project = projects.find(p => p._id === assign.projectId)
    const sprint = project?.sprints.find(s => s._id === assign.sprintId)
    if (project && sprint) {
      assignedSprints.value.push({ project, sprint })
    }
  }
})

function isTaskAssignedToMe(task) {
  if (!task.assignedTo || !currentUser.value) return false

  const assignedTo = task.assignedTo
  const currentEmail = currentUser.value.email
  const currentId = currentUser.value._id

  if (Array.isArray(assignedTo)) {
    return assignedTo.includes(currentEmail) || assignedTo.includes(currentId)
  }

  return assignedTo === currentEmail || assignedTo === currentId
}

async function assignToMe(task, sprintInfo) {
  const projectRes = await fetch(`${apiUrl}/api/projects/${sprintInfo.project._id}`)
  const project = await projectRes.json()

  const sprint = project.sprints.find(s => s._id === sprintInfo.sprint._id)
  if (!sprint) return alert('Sprint not found')

  const storeTask = sprint.tasks.find(t => t._id === task._id)
  if (!storeTask) return alert('Task not found')

  storeTask.assignedTo = currentUser.value._id
  storeTask.status = 'in-progress'

  const updateRes = await fetch(
    `${apiUrl}/api/projects/${project._id}/sprints/${sprint._id}/tasks`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: storeTask })
    }
  )

  if (!updateRes.ok) {
    const err = await updateRes.json()
    alert(`❌ Failed to assign task: ${err.message}`)
  } else {
    alert('✅ Task assigned successfully!')
  }
}

async function markComplete(task, sprintInfo) {
  const projectRes = await fetch(`${apiUrl}/api/projects/${sprintInfo.project._id}`)
  const project = await projectRes.json()

  const sprint = project.sprints.find(s => s._id === sprintInfo.sprint._id)
  const storeTask = sprint.tasks.find(t => t._id === task._id)

  storeTask.completed = true
  storeTask.status = 'done'

  await fetch(`${apiUrl}/api/projects/${project._id}/sprints/${sprint._id}/tasks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: storeTask })
  })
}
</script>

<style scoped>
.my-sprints {
  padding: 20px;
  background-color: white;
  max-width: 900px;
  margin: auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

th,
td {
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

.assign-btn,
.complete-btn {
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

.assign-btn:hover,
.complete-btn:hover {
  background: #1769aa;
}

.complete-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
</style>
