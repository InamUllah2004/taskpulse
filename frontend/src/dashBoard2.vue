<template>
    <Header :role="'developer'" class="heading" />
   <div class="con1">
        <div class="personal-info">
            <h1 class="text">Welcome Developer</h1>
            <div class="text1">
                <h2><strong>Name:</strong> {{ currentUser?.name }}</h2>
                <h2><strong>Email:</strong> {{ currentUser?.email }}</h2>
                <h2><strong>Role:</strong> {{ currentUser?.role }}</h2>
            </div>
        </div>

        <div class="Project-status">
            <h2 class="text">Your Task Progress</h2>
            <div style="width: 100%; max-width: 400px; height: 120px; position: relative; margin-top: 30px;">
                <div v-if="totalTasks > 0">
                    <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: completionPercent + '%' }"></div>
                    </div>
                    <div class="progress-label">{{ completedTasks }} / {{ totalTasks }} tasks completed ({{ completionPercent }}%)</div>
                </div>
                <div v-else style="margin-top: 30px; color: red; font-weight: bold;">
                    No tasks assigned to you.
                </div>
            </div>
        </div>
    </div>

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
                        <td>{{ task.title }}</td>
                        <td>
                            <span :class="task.status === 'done' ? 'status-complete' : 'status-pending'">
                                {{ task.status === 'done' ? 'Completed' : 'Pending' }}
                            </span>
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
import { ref, onMounted, computed } from 'vue'

const currentUser = ref(null)
const assignedTasks = ref([])
const totalTasks = computed(() => assignedTasks.value.length)
const completedTasks = computed(() => assignedTasks.value.filter(t => t.status === 'done').length)
const completionPercent = computed(() => totalTasks.value ? Math.round((completedTasks.value / totalTasks.value) * 100) : 0)

onMounted(async () => {
    const apiUrl = import.meta.env.VITE_API_URL; 
    console.log('api', apiUrl)
  const email = localStorage.getItem('currentEmail');
  const userRes = await fetch(`${apiUrl}/api/users`);
  const users = await userRes.json();
  currentUser.value = users.find(u => u.email === email);

  if (!currentUser.value) {
    alert('❌ Current user not found.');
    return;
  }
  alert(`✅ Logged in as: ${currentUser.value.name}`);

  const teamsRes = await fetch(`${apiUrl}/api/teams`);
  const teams = await teamsRes.json();
  const currentTeam = teams.find(team =>
    team.developers.some(dev => dev.email === currentUser.value.email)
  );

  if (!currentTeam) {
    alert('⚠️ No team found for this developer.');
    return;
  }
  alert('✅ Team found.');

  const projectsRes = await fetch(`${apiUrl}/api/projects`);
  const projects = await projectsRes.json();
  alert(`📦 Total Projects Fetched: ${projects.length}`);

  const assignments = currentTeam.sprintAssignments.filter(assign =>
    assign.developerIds.includes(currentUser.value._id)
  );

  alert(`📌 Total Sprint Assignments: ${assignments.length}`);

  for (const assign of assignments) {
    const project = projects.find(p => p._id === assign.projectId);
    if (!project) {
      alert(`❌ Project not found for ID: ${assign.projectId}`);
      continue;
    }

    const sprint = project?.sprints.find(s => s._id === assign.sprintId);
    if (!sprint) {
      alert(`⚠️ Sprint not found in project "${project.name}"`);
      continue;
    }

    alert(`🔍 Found sprint "${sprint.name}" in project "${project.name}"`);

    for (const task of sprint.tasks || []) {
      if (
        task.assignedTo === currentUser.value.email ||
        (Array.isArray(task.assignedTo) && task.assignedTo.includes(currentUser.value.email))
      ) {
        assignedTasks.value.push({
          ...task,
          projectName: project.name,
          sprintName: sprint.name
        });
      }
    }
  }

  alert(`✅ Total tasks assigned to you: ${assignedTasks.value.length}`);
});

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
