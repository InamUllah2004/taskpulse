<template>
  
  <div class="backGround">
  <h1 class="heading">Welcome to TaskPulse</h1>
  <div class="form1">
  <button
    class="tab-button"
    :class="activeTab === 'signup' ? 'active' : 'inactive'"
    @click="activeTab = 'signup'"
    type="button"
  >
    Sign Up
   </button>
   <button
    class="tab-button"
    :class="activeTab === 'login' ? 'active' : 'inactive'"
    @click="activeTab = 'login'"
    type="button"
   >
    Login
   </button>
  </div>
</div>

 <div class="form-container">
    <SignupForm v-if="activeTab === 'signup'" class="form2"/>
    <LoginForm v-else class="form3"/>
  </div>


</template>


<script setup>
import { ref } from 'vue'
import SignupForm from './signup.vue'
import LoginForm from './login.vue'
const activeTab = ref('signup') 

</script>

<style scoped>
.form1 {
  display: flex;
  position: absolute;
  justify-content: center;
  margin-top: 25px;
  width: fit-content;
  margin-left: 70px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.tab-button {
  width: 200px;
  height: 60px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: 0.3s ease;
  border-right: 1px solid #f6c90e;
  border-radius: 0;
}

.tab-button:last-child {
  border-right: none;
}

/* Active tab: yellow background, white text */
button.active {
  background-color: #f6c90e !important;
  color: white !important;
}
button.inactive  {
  background-color: white !important;
  color: #f6c90e !important; /* Yellow text for inactive */
}

/* Inactive tab on hover: soft yellow */
button.inactive:hover {
  background-color: #fff8dc !important;
}


.form-container {
  margin-top: 300px;
  margin-left: 70px;
}

.heading {
  position: relative;
  color: white;
  font-size: 50px;
  text-decoration: underline;
  margin-top: 100px;
  margin-left: 50px;
}

.con {
  position: relative;
  margin-left: 500px;
  width: 960px;
  height: 900px;
  margin-top: -700px;
  background-color:white;
}

.form2{
  margin-left:-40px;
  margin-top:50px;
}
.form3{
  position:relative;
  margin-left:-40px;
  margin-top:50px;
}
.backGround {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: url('./assets/back.jpg'); /* Replace with your image path */
  background-size: cover;       /* Makes the image cover the full screen */
  background-position: center;  /* Center the image */
  background-repeat: no-repeat; /* Prevent tiling */
}

</style>