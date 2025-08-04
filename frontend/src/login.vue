<template>
  <div class="login">
    <form class="login" @submit.prevent="handleLogin">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        @input="validateEmail"
        required
      />
      
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        :disabled="!emailValid"
        @input="validatePassword"
        required
      />
      
      <button
        type="submit"
        @click="handleClick"
        class="subBtn1">
        Login
      </button>

      <p v-if="errorMessage" style="color: red; margin-top: 10px;">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>


<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './store/userStore'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const emailValid = ref(false)
const passwordValid = ref(false)

const router = useRouter()
const store = useUserStore()

function validateEmail() {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  emailValid.value = regex.test(email.value)
}

function validatePassword() {
  passwordValid.value = password.value.length >= 6
}

async function handleLogin() {
  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    });

    if (!res.ok) {
      errorMessage.value = 'Invalid email or password.';
      return;
    }

    const user = await res.json();

    // Set in Pinia store
    store.currentEmail = user.email;
    store.currentRole = user.role;

    // Local storage
    localStorage.setItem('currentEmail', user.email);
    localStorage.setItem('currentRole', user.role);

    alert(`Welcome ${user.email}!`);
    alert(`Your role is ${user.role}`);
    email.value = '';
    password.value = '';
    errorMessage.value = '';

    // Redirect based on role
    if (user.role === 'projectDirector') router.push("/dash");
    else if (user.role === 'teamLead') router.push("/dashBoard1");
    else if (user.role === 'developer') router.push("/dashBoard2");

  } catch (e) {
    errorMessage.value = 'Login failed: ' + e.message;
  }
}

</script>


<style>
.login {
  max-width: 400px;
  margin: 50px auto;
  padding: 2rem;
  background-color: #fff8e1; /* Light yellow background */
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(255, 165, 0, 0.3); /* Soft orange shadow */
  margin-top: 50px;
  border: 2px solid #ffb300; /* Orange border */
}

input {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ffcc80; /* Light orange border */
  border-radius: 6px;
  background-color: #fff3e0; /* Very light orange bg */
  color: #333;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #ffa000; 
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #fb8c00; /* Slightly darker orange */
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.Signup {
  width: 90%;
  margin-left: 5px;
  margin-top: 7px;
  height: 35px;
}

.total {
  margin-top: 50px;
  margin-left: -50px;
}
.subBtn1 {
  background-color: #f6c90e; 
  color: white;
}
</style>
