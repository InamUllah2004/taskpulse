
<template>
  <Header :role="'projectDirector'" />
  <div class="dashboard">
    <h1>Project Director Dashboard</h1>
    <div class="section">
      <h2>View Teams</h2>
      <div v-if="!teams.length" class="no-teams">
        No teams created yet.
      </div>
      <div v-else>
        <div v-for="team in teams" :key="team._id || team.id" class="team-block">
          <p>
            <strong>Lead:</strong>
            {{ team.teamLead && team.teamLead.name ? team.teamLead.name : 'No lead assigned' }}
          </p>
          <p><strong>Developers:</strong></p>
          <ul>
            <li v-for="(dev, index) in team.developers" :key="dev._id || dev.id || index">
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
            <option v-for="lead in availableLeads" :key="lead._id || lead.id" :value="lead._id || lead.id">
              {{ lead.name }}
            </option>
          </select>
        </label>

        <label>Developers (Select up to 4):
          <select v-model="newTeam.developerIds" multiple required>
            <option v-for="dev in availableDevelopers" :key="dev._id || dev.id" :value="dev._id || dev.id">
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
            <option v-for="team in teams" :key="team._id || team.id" :value="team._id || team.id">
              Team {{ team._id || team.id }} ({{ team.teamLead?.name || 'No Lead' }})
            </option>
          </select>
        </label>

        <label>Project:
          <select v-model="selectedProjectId" required>
            <option disabled value="">Select Project</option>
            <option v-for="project in availableProjects" :key="project._id || project.id" :value="project._id || project.id">
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

import { ref, computed, onMounted } from 'vue'
import Header from './components/header.vue'

const teams = ref([])
const users = ref([])
const projects = ref([])
const newTeam = ref({ leadId: '', developerIds: [] })
const selectedTeamId = ref('')
const selectedProjectId = ref('')

// Fetch all data from backend
async function fetchAll() {
  try {
    const [teamRes, userRes, projectRes] = await Promise.all([
      fetch(import.meta.env.VITE_API_URL + '/api/teams'),
      fetch(import.meta.env.VITE_API_URL + '/api/users'),
      fetch(import.meta.env.VITE_API_URL + '/api/projects')
    ])

    teams.value = teamRes.ok ? await teamRes.json() : []
    users.value = userRes.ok ? await userRes.json() : []
    projects.value = projectRes.ok ? await projectRes.json() : []

    alert(`Fetched ${users.value.length} users`)
    alert(`Fetched ${teams.value.length} teams`)
    alert(`Fetched ${projects.value.length} projects`)

    console.log('Users:', users.value)
    console.log('Teams:', teams.value)
    console.log('Projects:', projects.value)

  } catch (e) {
    alert('Error fetching data: ' + e.message)
    console.error('FetchAll Error:', e)
    teams.value = []
    users.value = []
    projects.value = []
  }
}

onMounted(fetchAll)

const availableLeads = computed(() =>
  users.value.filter(user => user.role === 'teamLead' && user.available === 0)
)

const availableDevelopers = computed(() =>
  users.value.filter(user => user.role === 'developer' && user.available === 0)
)

const availableProjects = computed(() =>
  projects.value?.filter(p => p && p.name) || []
)
async function createTeam() {
  const developerIds = newTeam.value.developerIds.filter(Boolean);
  const leadId = newTeam.value.leadId;

  if (!leadId || developerIds.length !== 4) {
    alert('Please select one team lead and exactly 4 developers.');
    return;
  }

  const lead = users.value.find(u => u._id === leadId || u.id === leadId);
  const developers = developerIds.map(id => users.value.find(u => u._id === id || u.id === id));

  if (!lead || developers.includes(undefined)) {
    alert('Invalid team lead or developers.');
    return;
  }

  // Create team object
  const teamObj = {
    teamLead: { ...lead, available: 1 },
    developers: developers.map(dev => ({ ...dev, available: 1 })),
    assignedProjects: [],
    sprintAssignments: []
  };

  try {
    // Create the team first
    const res = await fetch(import.meta.env.VITE_API_URL + '/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(teamObj)
    });

    if (res.ok) {
      await new Promise(resolve => setTimeout(resolve, 300)); // wait 300ms
      // Now update lead's availability in DB
      await fetch(import.meta.env.VITE_API_URL + `/api/users/${lead._id || lead.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: 1 })
      });

      // Update each developer’s availability
      for (const dev of developers) {
        await fetch(import.meta.env.VITE_API_URL + `/api/users/${dev._id || dev.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ available: 1 })
        });
      }

      await fetchAll(); // Refresh data
      newTeam.value.leadId = '';
      newTeam.value.developerIds = [];
    } else {
      alert('Failed to create team.');
    }
  } catch (e) {
    alert('Failed to create team: ' + e.message);
    console.error(e);
  }
}


async function assignProjectToTeam() {
  const teamId = selectedTeamId.value
  const projectId = selectedProjectId.value
  if (!teamId || !projectId) {
    alert('Please select both a team and a project.')
    return
  }
  // Find team and update assignedProjects
  const team = teams.value.find(t => t._id === teamId || t.id === teamId)
  if (!team) return
  if (!team.assignedProjects) team.assignedProjects = []
  if (!team.assignedProjects.includes(projectId)) team.assignedProjects.push(projectId)
  try {
    const res = await fetch(import.meta.env.VITE_API_URL + `/api/teams/${team._id || team.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(team)
    })
    if (res.ok) {
      await fetchAll()
      selectedTeamId.value = ''
      selectedProjectId.value = ''
    } else {
      alert('Failed to assign project.')
    }
  } catch (e) {
    alert('Failed to assign project: ' + e.message)
  }
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
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

input,
select,
button {
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

h2 {
  color: red;
  text-decoration: underline;
}
</style>
