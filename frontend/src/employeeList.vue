<template>
   <Header :role="'projectDirector'" />
  <div class="section">
    <h2>All Users</h2>

    <ul class="user-list">
      <li v-for="user in users" :key="user._id || user.id" class="user-card">
        <p><strong>ID:</strong> {{ user._id || user.id }}</p>
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Password:</strong> {{ user.password }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <p><strong>Available:</strong> {{ user.available }}</p>
      </li>
    </ul>

    <div v-if="users.length === 0">
      No users found.
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import Header from './components/header.vue';
const users = ref([])

onMounted(async () => {
  const apiUrl = import.meta.env.VITE_API_URL; 
    console.log('api', apiUrl)
  try {
    const res = await fetch(`${apiUrl}/api/users`)
    if (res.ok) {
      users.value = await res.json()
    }
  } catch (e) {
    // Optionally handle error
    users.value = []
  }
})
</script>
<style scoped>
.user-list {
  list-style: none;
  padding: 0;
}

.user-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f9f9f9;
}
</style> 
