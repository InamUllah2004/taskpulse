<template>
  <button @click="handleBack" class="back">Back to Home</button>

  <div class="message-container">
    <h1 class="title">Group Chat 💬</h1>

    <button class="add-btn" @click="showForm = !showForm">
      {{ showForm ? 'Cancel' : 'Add Message' }}
    </button>

    <div v-if="showForm" class="form-container">
      <textarea v-model="newMessageContent" placeholder="Type your message here..."></textarea>
      <button @click="submitMessage" :disabled="!newMessageContent.trim()">Send</button>
    </div>

    <div v-if="messages.length > 0" class="message-list">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message-card"
      >
        <p><strong>{{ message.sender }}:</strong> {{ message.content }}</p>
        <small>{{ message.timestamp }}</small>
      </div>
    </div>

     <div v-else class="no-messages">
      <p>No messages yet. Start the conversation!</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from './store/messageStore'
import { useUserStore } from './store/userStore'

const router = useRouter()
const messageStore = useMessageStore()
const userStore = useUserStore()
const messages = messageStore.messages
const showForm = ref(false)
const newMessageContent = ref('')

// Get sender email from user store
const currentEmail = userStore.currentEmail || 'anonymous@chat.com'
const role=userStore.currentRole || 'guest'
function handleBack() {
  if(role === 'projectDirector') {
    router.push('/dash')
  } else if (role === 'teamLead') {
    router.push('/dashBoard1')
  } else {
    router.push('/dashBoard2')
  }
}

function submitMessage() {
  if (newMessageContent.value.trim()) {
    messageStore.addMessage(currentEmail, newMessageContent.value.trim())
    newMessageContent.value = ''
    showForm.value = false
  }
}
</script>

<style scoped>
.message-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  color: #0a0a0a;
  background-color: #ffcc00;
  position: relative;
  border-radius: 10px;
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-card {
  padding: 12px 16px;
  background-color: #f3f4f6;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.no-messages {
  text-align: center;
  font-style: italic;
  color: #555;
}

.add-btn {
  margin-bottom: 10px;
  padding: 6px 12px;
  background-color: #2d89ef;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.form-container {
  margin-bottom: 20px;
}

textarea {
  width: 100%;
  height: 80px;
  padding: 10px;
  margin-bottom: 10px;
  resize: none;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button:disabled {
  background-color: #999;
  cursor: not-allowed;
}

.back {
  width: 10%;
  margin-bottom: 10px;
}
</style>
