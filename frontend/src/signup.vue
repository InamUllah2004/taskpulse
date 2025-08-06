<template>
  <div class="signup">
    <form class="sign1" @submit.prevent="handleSignup">
      <input type="text" v-model="name" placeholder="Name" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <input type="password" v-model="confirmPassword" placeholder="Confirm Password" required />

      <!-- Updated Role Selector -->
      <div class="role-selection">
    <button
      class="role-button"
      @click="selectedRole = 'projectDirector'"
    >
      Project Director
    </button>
    <button
      class="role-button"
      @click="selectedRole = 'teamLead'"
    >
      Team Lead
    </button>
    <button
      class="role-button"
      @click="selectedRole = 'developer'"
    >
      Developer
    </button>
  </div>

      <button type="submit" @click="handleClick" class="subBtn">Sign Up</button>
      <p v-if="errorMessage" style="color: red; margin-top: 10px;">{{ errorMessage }}</p>
    </form>
  </div>

</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from './store/userStore'
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const selectedRole = ref('')
const errorMessage = ref('')
const store = useUserStore()

const validateEmail = () => /^[\w.+\-]+@gmail\.com$/.test(email.value)
const validatePassword = () => /^[A-Z].*/.test(password.value)

const handleClick = async () => {
  if (!name.value) {
    errorMessage.value = 'Name is required.'
  } else if (!validateEmail()) {
    errorMessage.value = 'Email must end with @gmail.com'
  } else if (!validatePassword()) {
    errorMessage.value = 'Password must start with a capital letter'
  } else if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
  } else if (!selectedRole.value) {
    errorMessage.value = 'Please select a role'
  } else {
    errorMessage.value = ''
    // Check if email exists in DB
    const apiUrl = import.meta.env.VITE_API_URL; 
    console.log('api', apiUrl)
    try {
      const checkRes = await fetch(`${apiUrl}/api/users`);
      const users = checkRes.ok ? await checkRes.json() : [];
      const emailExists = users.some(user => user.email === email.value);
      if (emailExists) {
        errorMessage.value = 'Email already exists. Please use another email.';
        return;
      }
    } catch (e) {
      errorMessage.value = 'Could not verify email. Try again.';
      return;
    }
    // Insert user in MongoDB
    try {
      const res = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value,
          email: email.value,
          password: password.value,
          role: selectedRole.value
        })
      });
      if (res.ok) {
        alert(`Sign Up Successful as ${selectedRole.value} (saved to DB)`);
        name.value = '';
        email.value = '';
        password.value = '';
        confirmPassword.value = '';
        selectedRole.value = '';
      } else {
        errorMessage.value = 'Failed to save user to DB.';
      }
    } catch (e) {
      errorMessage.value = 'Sign Up failed. Try again.';
    }
  }
}
</script>



<style>
.signup {
  position: relative;
  max-width: 400px;
  margin: 50px auto;
  padding: 2rem;
  background-color: #fff8dc; /* light yellow (soft cream) */
  border-radius: 12px;
  border: 2px solid #f6c90e; /* golden yellow border */
  box-shadow: 0 0 15px rgba(246, 201, 14, 0.6); /* soft yellow glow */
  margin-top: 300px;
  margin-left: -20px;
}


input {
  display: block;
  width: 100%;
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  width: 100%;
  padding: 10px;
  /* background: linear-gradient(to right, #f6c90e 0%, #f6c90e 100%); */
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

button:hover {
  background: linear-gradient(to right, #e0b200 0%, #e0b200 100%);
}

.role-selection {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  gap: 10px;
}

.role-button {
  flex: 1;
  padding: 10px;
  background-color:  #f6c90e;
  color:white;
  font-weight: bold;
  border: 1px solid #f6c90e;
  cursor: pointer;
 
}

.role-button:first-child {
  border-right: none;
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}

.role-button:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

/* Yellow background only on hover or click */
.role-button:hover,
.role-button:focus,
.role-button:active {
  background-color: #f6c90e;
  color: white;
}

.logIn {
  width: 90%;
  margin-left: 5px;
  margin-top: 7px;
  height: 35px;
}
.subBtn{
    background-color: #f6c90e;
    color: white;
}
</style>