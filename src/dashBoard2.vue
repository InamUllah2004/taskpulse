<template>
    <Header :role="'developer'" class="heading" />

    <div class="con1">
        <!-- Personal Information -->
        <div class="personal-info">
            <h1 class="text">Welcome Developer</h1>
            <div class="text1">
                <h2><strong>Name:</strong> {{ currentUser?.name }}</h2>
                <h2><strong>Email:</strong> {{ currentUser?.email }}</h2>
                <h2><strong>Role:</strong> {{ currentUser?.role }}</h2>
            </div>
        </div>

        <!-- Task Progress -->
        <div class="Project-status">
            <h2 class="text">Your Task Progress</h2>
            <div style="width: 100%; max-width: 400px; height: 120px; position: relative; margin-top: 30px;">
                <div v-if="totalTasks > 0">
                    <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: completionPercent + '%' }"></div>
                    </div>
                    <div class="progress-label">{{ completedTasks }} / {{ totalTasks }} tasks completed ({{
                        completionPercent }}%)</div>
                </div>
                <div v-else style="margin-top: 30px; color: red; font-weight: bold;">
                    No tasks assigned to you.
                </div>
            </div>
        </div>
    </div>

    <!-- Task List -->
    <div class="con2">
        <div class="task-list">
            <h1>📝 Your Assigned Tasks</h1>
            <table v-if="assignedTasks.length">
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Sprint</th>
                        <th>Task</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="task in assignedTasks" :key="task.id">
                        <td>{{ task.projectName }}</td>
                        <td>{{ task.sprintName }}</td>
                        <td>{{ task.name }}</td>
                        <td>
                            <span :class="task.completed ? 'status-complete' : 'status-pending'">
                                {{ task.completed ? 'Completed' : 'Pending' }}
                            </span>
                            <!-- Complete button removed: task completion is now handled in mySprints.vue -->
                        </td>
                    </tr>

                </tbody>
            </table>
            <div v-else>
                <p>No tasks assigned to you.</p>
            </div>
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

// ✅ Get logged-in user
const currentUser = computed(() =>
    userStore.users.find(u => u.email === userStore.currentEmail)
)

// ✅ Get team of current developer
const currentTeam = computed(() =>
    teamStore.teams.find(team =>
        Array.isArray(team.developers) &&
        team.developers.some(dev => dev?.email === currentUser.value?.email)
    )
)

// ✅ Get all tasks actually selected/assigned to current developer
const assignedTasks = computed(() => {
    if (!currentUser.value || !currentTeam.value) return []

    // Find all sprints assigned to this developer via sprintAssignments
    const sprintAssignments = Array.isArray(currentTeam.value.sprintAssignments)
        ? currentTeam.value.sprintAssignments
        : []
    const assignedSprints = sprintAssignments
        .filter(a => Array.isArray(a.developerIds) && a.developerIds.includes(currentUser.value.id))
        .map(a => {
            const project = projectStore.projects.find(p => p.id === a.projectId)
            const sprint = project?.sprints?.find(s => s.id === a.sprintId)
            return {
                projectName: project?.name,
                sprintName: sprint?.name,
                sprint,
                project
            }
        })
        .filter(a => a.sprint && a.project)

    // Only include tasks where assignedTo includes the current user's email
    let tasks = []
    for (const s of assignedSprints) {
        for (const task of s.sprint.tasks || []) {
            if (Array.isArray(task.assignedTo) && task.assignedTo.includes(currentUser.value.email)) {
                tasks.push({
                    ...task,
                    projectName: s.projectName,
                    sprintName: s.sprintName
                })
            } else if (typeof task.assignedTo === 'string' && task.assignedTo === currentUser.value.email) {
                tasks.push({
                    ...task,
                    projectName: s.projectName,
                    sprintName: s.sprintName
                })
            }
        }
    }
    return tasks
})

const totalTasks = computed(() => assignedTasks.value.length)
const completedTasks = computed(() =>
    assignedTasks.value.filter(task => task.completed).length
)
const completionPercent = computed(() =>
    totalTasks.value ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0
)
function markTaskComplete(task) {
  // Find the project and sprint in the store
  const project = projectStore.projects.find(p => p.name === task.projectName)
  const sprint = project?.sprints?.find(s => s.name === task.sprintName)
  const storeTask = sprint?.tasks?.find(t => t.id === task.id)
  if (storeTask) {
    storeTask.completed = true
    if (typeof projectStore.saveToLocalStorage === 'function') {
      projectStore.saveToLocalStorage()
    }
  }
}
</script>

<style scoped>
.heading {
    top: 0;
}

.con1 {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50vh;
    background-color: #000c1c;
    color: white;
    border-radius: 10px;
    margin-top: 20px;
    border: 3px solid #ffcc00;
    position: relative;
}

.personal-info {
    text-align: center;
    background-color: #ffcc00;
    color: #000c1c;
    width: 30%;
    height: 40vh;
    margin-left: -700px;
    border-radius: 10px;
    padding: 10px;
}

.text {
    text-decoration: underline;
    color: white;
}

.text1 {
    text-align: left;
    margin-top: 20px;
    padding-left: 20px;
}

.Project-status {
    text-align: center;
    background-color: #ffcc00;
    color: #000c1c;
    width: 35%;
    height: 40vh;
    margin-left: 550px;
    border-radius: 10px;
    position: absolute;
    padding: 20px;
}

.progress-bar-container {
    width: 100%;
    height: 18px;
    background: #eee;
    border-radius: 10px;
    margin-bottom: 8px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: #4caf50;
    border-radius: 10px 0 0 10px;
    transition: width 0.3s;
}

.progress-label {
    font-size: 1.1em;
    color: #333;
    font-weight: bold;
}

.con2 {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: #ffcc00;
    color: white;
    border-radius: 10px;
    margin-top: 20px;
    border: 3px solid #ffcc00;
    padding: 30px 0;
    min-height: 40vh;
}

.task-list {
    width: 100%;
    text-align: center;
    color: #000c1c;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    background: white;
    color: #000c1c;
    border-radius: 8px;
    overflow: hidden;
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
    .status-pending {
        color: #d84315;
        font-weight: bold;
    }

    .complete-btn {
        margin-left: 10px;
        background: #2196f3;
        color: #fff;
        border: none;
        border-radius: 6px;
        padding: 4px 14px;
        font-size: 0.98em;
        font-weight: bold;
        cursor: pointer;
        transition: background 0.2s;
    }

    .complete-btn:hover {
        background: #1769aa;
    }
}
</style>
