<template>
  <Header :role="'projectDirector'" class="heading" />
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
      <div style="width: 100%; max-width: 400px; height: 300px; position: relative;">
        <canvas id="projectProgressChart" style="width: 100%; height: 90%;margin-top: 20px;margin-left: 50px;"></canvas>
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
          <small>{{ latestMessage.timestamp }}</small>
        </router-link>
      </div>
      <div v-else>
        <p>No messages yet.</p>
      </div>
    </div>
  </div>


</template>


<script setup>
import Header from './components/header.vue';
import { onMounted, ref, computed } from 'vue'
import Chart from 'chart.js/auto'
import { useMessageStore } from './store/messageStore'

const messageStore = useMessageStore()
const latestMessage = computed(() => {
  const messages = messageStore.messages
  return messages.length ? messages[messages.length - 1] : null
})

// MongoDB-backed user and project data
const currentUser = ref(null)
const projects = ref([])

onMounted(async () => {
  const apiUrl = import.meta.env.VITE_API_URL; 
    console.log('api', apiUrl)
  // Get currentEmail from localStorage
  const currentEmail = localStorage.getItem('currentEmail')
  // Fetch users from backend
  try {
    const userRes = await fetch(`${apiUrl}/api/users`)
    if (userRes.ok) {
      const users = await userRes.json()
      currentUser.value = users.find(u => u.email === currentEmail)
      
    }
  } catch (e) {
    currentUser.value = null
  }
  // Fetch projects from backend
  try {
    const projRes = await fetch(`${apiUrl}/api/projects`)
    if (projRes.ok) {
      projects.value = await projRes.json()
      
    }
  } catch (e) {
   
    projects.value = []
  }

 // Chart.js logic
  const completedCount = projects.value.filter(p => p.progress === 100).length
  const halfwayCount = projects.value.filter(p => p.progress > 50 && p.progress < 100).length
  const uncompletedCount = projects.value.filter(p => p.progress <= 50).length

  const ctx = document.getElementById('projectProgressChart').getContext('2d')
  new Chart(ctx, {
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
</style>