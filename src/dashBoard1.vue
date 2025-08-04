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
import Header from './components/header.vue'
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Chart from 'chart.js/auto'
import { useMessageStore } from './store/messageStore.js'

const users = ref([])
const teams = ref([])
const projects = ref([])
const currentUser = ref(null)
const showChart = ref(false)
const noDataMessage = ref('')
const chartCanvas = ref(null)
const chartInstance = ref(null)
const router = useRouter()
const messageStore = useMessageStore()
const newMessage = ref('')

function formatTime(ts) {
  const date = new Date(ts)
  return isNaN(date.getTime()) ? ts : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

async function fetchAll() {
  try {
    const [userRes, teamRes, projectRes] = await Promise.all([
      fetch('http://localhost:3000/api/users'),
      fetch('http://localhost:3000/api/teams'),
      fetch('http://localhost:3000/api/projects')
    ])

    users.value = userRes.ok ? await userRes.json() : []
    teams.value = teamRes.ok ? await teamRes.json() : []
    projects.value = projectRes.ok ? await projectRes.json() : []
  } catch (e) {
    console.error('🔥 Error in fetchAll():', e)
    users.value = []
    teams.value = []
    projects.value = []
  }
}

async function initializeDashboard() {
  await fetchAll()

  const email = localStorage.getItem('currentEmail')
  if (!email) {
    alert('No email found in localStorage. Please login.')
    return
  }

  currentUser.value = users.value.find(u => u.email === email) || users.value[0] || null

  if (!currentUser.value) {
    alert('User not found. Please login again.')
    return
  }

  const leadTeam = teams.value.find(team => team?.teamLead?.email === currentUser.value.email)
  if (!leadTeam) {
    noDataMessage.value = 'No team assigned to you.'
    return
  }

  const assignedProjectIds = leadTeam.assignedProjects?.map(p => p._id || p.id) || []
  const assignedProjects = projects.value.filter(p => assignedProjectIds.includes(p._id || p.id))

  if (assignedProjects.length === 0) {
    noDataMessage.value = 'No projects assigned to your team.'
    return
  }

  const [completedCount, halfwayCount, uncompletedCount] = assignedProjects.reduce(
    ([c, h, u], p) => p.progress === 100 ? [c + 1, h, u] : p.progress > 50 ? [c, h + 1, u] : [c, h, u + 1],
    [0, 0, 0]
  )

  showChart.value = true
  const ctx = chartCanvas.value?.getContext('2d')
  if (!ctx) return

  if (chartInstance.value) chartInstance.value.destroy()

  chartInstance.value = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Completed', 'Halfway', 'Uncompleted'],
      datasets: [{
        data: [completedCount, halfwayCount, uncompletedCount],
        backgroundColor: ['#4CAF50', '#2196F3', '#FF5722'],
        borderColor: ['#388E3C', '#1976D2', '#D84315'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } }
    }
  })
}

onMounted(() => initializeDashboard())

async function sendMessage() {
  if (!newMessage.value.trim()) return
  const msg = {
    sender: currentUser.value?.name || 'Unknown',
    content: newMessage.value,
    timestamp: new Date().toISOString()
  }
  try {
    await messageStore.addMessage(msg)
    newMessage.value = ''
  } catch (e) {
    console.error('Message send failed:', e)
  }
}

const latestMessage = computed(() => messageStore.messages.at(-1))
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


