<template>
  <Header :role="'projectDirector'"/>
  <div class="dashboard">
    <h1>Project Director Dashboard</h1>
     <div class="section">
   <h2>View Teams</h2>
   <div v-if="!teams || teams.length === 0" class="no-teams">
      No teams created yet.
    </div>

    <div v-else>
      <div v-for="team in teams" :key="team.id" class="team-block">
        <p>
          <strong>Lead:</strong>
          {{ team.teamLead && team.teamLead.name ? team.teamLead.name : 'No lead assigned' }}
        </p>
         <p><strong>Developers:</strong></p>
        <ul>
          <li v-for="(dev, index) in team.developers" :key="dev.id || index">
            <div v-if="dev && dev.name">
              {{ dev.name }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
   
  <div class="section">
      <h2>Create New Team</h2>
      <form @submit.prevent="createTeam">
        <label>Team Lead:
          <select v-model="newTeam.leadId" required>
            <option disabled value="">Select Lead</option>
            <option v-for="lead in availableLeads" :key="lead.id" :value="lead.id">
              {{ lead.name }}
            </option>
          </select>
        </label>

        <label>Developers (Select up to 4):
          <select v-model="newTeam.developerIds" multiple required>
            <option v-for="dev in availableDevelopers" :key="dev.id" :value="dev.id">
              {{ dev.name }}
            </option>
          </select>
        </label>

        <button type="submit">Create Team</button>
      </form>
    </div>
    <div class="section">
  <h2>Assign Project to Team</h2>
  <form @submit.prevent="assignProjectToTeam">
    <label>Team:
      <select v-model="selectedTeamId" required>
        <option disabled value="">Select Team</option>
        <option v-for="team in teams" :key="team.id" :value="team.id">
          Team {{ team.id }} ({{ team.teamLead?.name || 'No Lead' }})
        </option>
      </select>
    </label>

    <label>Project:
      <select v-model="selectedProjectId" required>
        <option disabled value="">Select Project</option>
        <option v-for="project in availableProjects" :key="project.id" :value="project.id">
          {{ project.name }}
        </option>
      </select>
    </label>

    <button type="submit">Assign Project</button>
  </form>
 </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTeamStore } from './store/teamStore'
import { useUserStore } from './store/userStore'
import Header from './components/header.vue'
import {Team} from './store/team'
import { onMounted, toValue } from 'vue'
import { useProjectStore } from './store/projectStore'
// Stores
const teamStore = useTeamStore()
const userStore = useUserStore()
const project = useProjectStore()

onMounted(() => {
  console.log(toValue(teams)[0].developers[0].name)
})

const teams = computed(() => teamStore.teams)
// Reactive form data
const newTeam = ref({
  leadId: '',
  developerIds: []
})

// Computed options for dropdowns
const availableLeads = computed(() =>
  userStore.users.filter(user => user.role === 'teamLead' && user.available === 0)
);
const availableDevelopers = computed(() =>
  userStore.users.filter(user => user.role === 'developer' && user.available === 0)
); 

// createTeam function from before
function createTeam() {
  const developerIds = newTeam.value.developerIds.map(id => Number(id));
  const leadId = Number(newTeam.value.leadId);

  const lead = userStore.users.find(u => u.id === leadId);
  const developers = developerIds.map(id => userStore.users.find(u => u.id === id));

  if (!lead || developers.length !== 4) {
    alert("Please select one team lead and exactly 4 developers.");
    return;
  }

  const team = new Team();
  team.teamLead = lead;
  team.developers = developers;

  teamStore.addTeam(team);

  // ✅ mark users as unavailable using updateAvailability
  userStore.updateAvailability(lead.id, 1);
  developers.forEach(dev => userStore.updateAvailability(dev.id, 1));

  // ✅ reset form
  newTeam.value.leadId = '';
  newTeam.value.developerIds = [];
}
const selectedTeamId = ref('');
const selectedProjectId = ref('');

const availableProjects = computed(() =>
  project.projects?.filter(p => p && p.name) || []
);

function assignProjectToTeam() {
  const teamId = Number(selectedTeamId.value);
  const projectId = Number(selectedProjectId.value);

  if (!teamId || !projectId) {
    alert("Please select both a team and a project.");
    return;
  }

  teamStore.assignToProject(teamId, projectId);

  // reset form
  selectedTeamId.value = '';
  selectedProjectId.value = '';
}


</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  padding: 20px;
  background-color: #f2f2f2;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

input, select, button {
  width: 100%;
  margin-top: 4px;
  margin-bottom: 15px;
  padding: 8px;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

.team-lead {
  font-weight: bold;
  margin-top: 10px;
}

.developer {
  margin-left: 15px;
}
h2{
  color:red;
  text-decoration: underline;
}
</style> 

