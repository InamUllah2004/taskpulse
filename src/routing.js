import { createRouter, createWebHistory } from 'vue-router'
import Signup from './signup.vue';
import Login from './login.vue';
import Home from './home.vue';
import dash from './dashboard.vue'
import message from './message.vue';
import projectManagement from './projectManagement.vue';
import sprintManagement from './sprintManagement.vue';
import teamManagement from './teamManagement.vue';
import employeeList from './employeeList.vue';
import dashBoard1 from './dashBoard1.vue';
import dashBoard2 from './dashBoard2.vue';
import sprintAssignment from './sprintAssignment.vue';
import progress from './progress.vue';
import mySprints from './mySprints.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/signup', component: Signup },
  { path: '/login', component: Login },
  { path: '/dash', component: dash },
  { path: '/msg', component: message },
  { path: '/project-management', component: projectManagement },
  { path: '/sprint-management', component: sprintManagement },
  { path: '/team-management', component: teamManagement },
  { path: '/employee-list', component: employeeList },
  { path: '/dashboard1', component: dashBoard1 },
  { path: '/sprint-assignment', component: sprintAssignment },
  { path: '/progress', component: progress },
  { path: '/dashboard2', component: dashBoard2 },
  { path: '/my-sprints', component: mySprints }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
