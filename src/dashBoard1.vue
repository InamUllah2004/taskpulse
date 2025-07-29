<template>
  <Header :role="'teamLead'" class="heading" />
  <div class="con1">
    <!--Personal Information-->
    <div class="personal-info">
      <h1 class="text">Welcome Project Director</h1>
      <div class="text1">
        <h2><strong>Name:</strong> {{ currentUser?.name }}</h2>
        <h2><strong>Email:</strong> {{ currentUser?.email }}</h2>
        <h2><strong>Role:</strong> {{ currentUser?.role }}</h2>
      </div>
    </div>

    <!--Projects Status-->
    <div class="Project-status">
      <h2 class="text">Project Completion Status</h2>
      <div style="width: 100%; max-width: 400px; height: 280px; position: relative;">
        <canvas v-show="showChart" ref="chartCanvas" id="projectProgressChart1" style="width: 100%; height: 90%; margin-top: 20px; margin-left: 50px;"></canvas>
        <div v-show="!showChart" style="margin-top: 80px; color: red; font-weight: bold;">
          {{ noDataMessage }}
        </div>
      </div>
    </div>
  </div>

  <!-- Group Chat Preview Section -->
  <div class="con2">
    <div class="chat-preview">
      <h1>📨 Group Chat</h1>
      <div v-if="latestMessage" class="chat-message">
        <router-link to="/msg" class="chat-link">
          <p><strong>{{ latestMessage.sender }}:</strong> {{ latestMessage.content }}</p>
          <small>{{ formatTime(latestMessage.timestamp) }}</small>
        </router-link>
      </div>
      <div v-else>
        <p>No messages yet.</p>
        <div class="new-message-box">
          <input
            v-model="newMessage"
            type="text"
            placeholder="Type your message..."
            class="new-message-input"
          />
          <button @click="sendMessage" :disabled="!newMessage.trim()" class="send-btn">Send</button>
        </div>
      </div>
    </div>
  </div>
</template>



<script setup>
// Format time for chat preview
function formatTime(ts) {
  // Try to parse as Date, fallback to string
  const date = new Date(ts)
  if (isNaN(date.getTime())) return ts
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
import Header from './components/header.vue'
import { onMounted, computed, ref } from 'vue'
import { useUserStore } from './store/userStore'
import { useProjectStore } from './store/projectStore'
import { useTeamStore } from './store/teamStore'
import { useMessageStore } from './store/messageStore'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'

const userStore = useUserStore()
const projectStore = useProjectStore()
const teamStore = useTeamStore()
const messageStore = useMessageStore()
const router = useRouter()

const showChart = ref(false)
const noDataMessage = ref('')
const chartCanvas = ref(null)
const chartInstance = ref(null)

// Get current user
const currentUser = userStore.users.find(u => u.email === userStore.currentEmail)


// For new message input if no messages
const newMessage = ref('')
function sendMessage() {
  if (!newMessage.value.trim()) return
  messageStore.addMessage({
    sender: currentUser?.name || 'Unknown',
    content: newMessage.value,
    timestamp: new Date().toLocaleString()
  })
  newMessage.value = ''
}

// Get latest message for chat preview
const latestMessage = computed(() => {
  const messages = messageStore.messages
  return messages.length ? messages[messages.length - 1] : null
})

function goToMsg() {
  showNoMessageCard.value = false
  router.push('/msg')
}

onMounted(() => {
  if (!currentUser) {
    noDataMessage.value = 'User not found.'
    return
  }

  const leadTeam = teamStore.teams.find(team => team.teamLead.email === currentUser.email)
  if (!leadTeam) {
    noDataMessage.value = 'No team assigned to you.'
    return
  }

  const assignedProjectIds = leadTeam.assignedProjects
  const assignedProjects = projectStore.projects.filter(p => assignedProjectIds.includes(p.id))

  console.log('Assigned Project IDs:', assignedProjectIds)
  console.log('Assigned Projects:', assignedProjects)

  if (assignedProjects.length === 0) {
    noDataMessage.value = 'No projects assigned to your team.'
    return
  }

  let completedCount = 0
  let halfwayCount = 0
  let uncompletedCount = 0

  assignedProjects.forEach(project => {
    if (project.progress === 100) {
      completedCount++
    } else if (project.progress > 50) {
      halfwayCount++
    } else {
      uncompletedCount++
    }
  })

  showChart.value = true

  const ctx1 = chartCanvas.value?.getContext('2d')
  if (!ctx1) {
    console.error('Unable to get 2D context.')
    return  
  }

  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  chartInstance.value = new Chart(ctx1, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Halfway', 'Uncompleted'],
      datasets: [{
        label: 'Projects Status',
        data: [completedCount, halfwayCount, uncompletedCount],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#D84315'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })
})
</script>

<style scoped>
body {
  background-color: #000c1c;
}

.heading {
  top: 0;
}

.con1 {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: white;
  background-color: #000c1c;
  border-radius: 10px;
  margin-top: 20px;
  border: 3px solid #ffcc00;
}

.personal-info {
  text-align: center;
  position: absolute;
  background-color: #ffcc00;
  color: #000c1c;
  width: 30%;
  height: 40vh;
  margin-left: -700px;
  border-radius: 10px;
}

.text {
  text-decoration: underline;
  color: white;
  margin-left: -10px;
}

.text1 {
  position: absolute;
  text-align: left;
  margin-top: 20px;
}

.Project-status {
  text-align: center;
  background-color: #ffcc00;
  color: #000c1c;
  width: 35%;
  height: 40vh;
  margin-left: 20px;
  border-radius: 10px;
  position: absolute;
  margin-left: 550px;
}

.con2 {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
  color: white;
  background-color: #ffcc00;
  border-radius: 10px;
  margin-top: 20px;
  border: 3px solid #ffcc00;
}

.chat-preview {
  width: 100%;
  text-align: center;
  color: #000c1c;
}

.chat-link {
  display: block;
  background-color: white;
  padding: 10px 20px;
  margin: 10px auto;
  max-width: 500px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s;
}

.chat-link:hover {
  background-color: #f1f1f1;
}
.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.msg-sender {
  font-weight: bold;
  color: #1769aa;
}
.msg-time {
  font-size: 0.95em;
  color: #888;
  margin-left: 10px;
}
.msg-content {
  color: #222;
  font-size: 1.08em;
  margin-top: 2px;
}
.overlay-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}
.no-message-card {
  background: #fff;
  color: #000c1c;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 36px 40px 28px 40px;
  text-align: center;
  min-width: 320px;
}
.go-msg-btn {
  margin-top: 18px;
  background: #2196f3;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 32px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}
.go-msg-btn:hover {
  background: #1769aa;
}
.new-message-box {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  justify-content: center;
}
.new-message-input {
  padding: 6px 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 220px;
}
.send-btn {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}
.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>


