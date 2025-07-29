<template>
   <Header :role="'projectDirector'" />
  <div class="section">
    <h2>All Users</h2>

    <ul class="user-list">
      <li v-for="user in userStore.users" :key="user.id" class="user-card">
        <p><strong>ID:</strong> {{ user.id }}</p>
        <p><strong>Name:</strong> {{ user.name }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Password:</strong> {{ user.password }}</p>
        <p><strong>Role:</strong> {{ user.role }}</p>
        <p><strong>Available:</strong> {{ user.available }}</p>
      </li>
    </ul>

    <div v-if="userStore.users.length === 0">
      No users found.
    </div>
  </div>
</template>
<script setup>
import { useUserStore } from './store/userStore'
import header from './components/header.vue';
import Header from './components/header.vue';
const userStore = useUserStore()
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
