<template>
  <Header :role="'projectDirector'" />
  <div class="container">
    <h1 class="title">Sprint Management</h1>

    <ul class="project-list">
      <li v-for="project in projects" :key="project._id || project.id" class="project-card">
        <div class="project-header">
          <div>
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-description">{{ project.description }}</p>
          </div>
          <button @click="toggleProject(project._id || project.id)" class="btn-primary">
            {{ openProjectId === (project._id || project.id) ? 'Hide Sprints' : 'Manage Sprints' }}
          </button>
        </div>

        <div v-if="openProjectId === (project._id || project.id)" class="sprint-section">
          <h4 class="sprint-title">Sprints for: {{ project.name }}</h4>
          <ul v-if="project.sprints?.length" class="sprint-list">
            <li v-for="sprint in project.sprints" :key="sprint.id" class="sprint-card">
              <div>
                <strong>{{ sprint.name }}</strong> ({{ sprint.startDate }} → {{ sprint.endDate }})
                <p class="sprint-goal">{{ sprint.goal }}</p>
              </div>
              <div class="task-buttons">
                <button class="add-btn" @click="openTaskModal(project._id || project.id, sprint.id)">Add Task</button>
                <button class="view-btn" @click="openViewModal(sprint.id, project._id || project.id)">View
                  Tasks</button>
                <button class="delete-btn" @click="deleteSprint(project._id || project.id, sprint.id)">Delete</button>
              </div>
            </li>
          </ul>
          <p v-else>No sprints found for this project.</p>

          <form @submit.prevent="handleAddSprint(project._id || project.id)" class="sprint-form">
            <input v-model="sprintData.name" placeholder="Sprint Name" required />
            <input v-model="sprintData.goal" placeholder="Sprint Goal" required />
            <input v-model="sprintData.startDate" type="date" required />
            <input v-model="sprintData.endDate" type="date" required />
            <button type="submit" class="btn-primary">Add Sprint</button>
          </form>
        </div>
      </li>
    </ul>

    <!-- Task Modal -->
    <div v-if="selectedSprint" class="modal-overlay">
      <div class="modal">
        <h3>Add Task to: {{ selectedSprint.name }}</h3>
        <form @submit.prevent="addTask">
          <input v-model="taskData.title" placeholder="Task Title" required />
          <input v-model="taskData.description" placeholder="Task Description" required />
          <div class="task-buttons">
            <button type="submit" class="add-btn">Add Task</button>
            <button type="button" class="delete-btn" @click="closeTaskModal">Close</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Tasks Modal -->
    <div v-if="viewSprint" class="modal-overlay">
      <div class="modal">
        <h3>Tasks for: {{ viewSprint.name }}</h3>
        <div v-if="viewSprint.tasks?.length">
          <ul>
            <li v-for="task in viewSprint.tasks" :key="task.id">
              <strong>{{ task.title }}</strong> - {{ task.description }} <em>({{ task.status }})</em>
            </li>
          </ul>
        </div>
        <p v-else>No tasks added to this sprint.</p>
        <button class="btn-primary" @click="closeViewModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Header from './components/header.vue'

const projects = ref([])
const openProjectId = ref(null)
const selectedSprint = ref(null)
const selectedProjectId = ref(null)
const viewSprint = ref(null)
const sprintData = ref({ name: '', goal: '', startDate: '', endDate: '' })
const taskData = ref({ title: '', description: '' })

async function fetchProjects() {
  const res = await fetch(import.meta.env.VITE_API_URL + '/api/projects')
  const data = await res.json()
  projects.value = data.map(p => ({ ...p, sprints: p.sprints || [] }))
}
fetchProjects()

function toggleProject(projectId) {
  openProjectId.value = openProjectId.value === projectId ? null : projectId
}

function openViewModal(sprintId, projectId) {
  const project = projects.value.find(p => p._id === projectId || p.id === projectId);
  const sprint = project?.sprints?.find(s => s.id === sprintId);
  if (sprint) {
    viewSprint.value = JSON.parse(JSON.stringify({ ...sprint, tasks: sprint.tasks || [] }));
  }
}
function closeViewModal() {
  viewSprint.value = null
}

function openTaskModal(projectId, sprintId) {
  const project = projects.value.find(p => p._id === projectId || p.id === projectId)
  const sprint = project?.sprints?.find(s => s.id === sprintId)
  if (sprint) {
    selectedProjectId.value = projectId
    selectedSprint.value = JSON.parse(JSON.stringify({ ...sprint, tasks: sprint.tasks || [] }))
    taskData.value = { title: '', description: '' }
  }
}

function closeTaskModal() {
  selectedSprint.value = null
  selectedProjectId.value = null
}

async function handleAddSprint(projectId) {
  const { name, goal, startDate, endDate } = sprintData.value;
  if (new Date(endDate) <= new Date(startDate)) return alert('End date must be after start date!');

  const newSprint = {
    id: Date.now(),
    name,
    goal,
    startDate,
    endDate,
    tasks: []
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/sprints`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sprint: newSprint })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to add sprint');
    alert('Sprint added!');
    sprintData.value = { name: '', goal: '', startDate: '', endDate: '' };
    fetchProjects();
  } catch (error) {
    console.error(error.message);
    alert('Error adding sprint.');
  }
}

async function deleteSprint(projectId, sprintId) {
  await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/sprints/${sprintId}`, {
    method: 'DELETE'
  })
  fetchProjects()
}

const addTask = async () => {
  const projectId = selectedProjectId.value;
  const sprintId = selectedSprint.value?.id || selectedSprint.value?._id;

  if (!projectId || !sprintId) {
    console.error('❌ Missing projectId or sprintId');
    return;
  }

  const newTask = {
    id: Date.now(),
    title: taskData.value.title,
    description: taskData.value.description,
    status: 'todo'
  };

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${projectId}/sprints/${sprintId}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: newTask })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add task');

    await fetchProjects();
    closeTaskModal();

    console.log('✅ Task added:', data);
  } catch (err) {
    console.error('❌ Error adding task:', err.message);
  }
};
</script>

<style scoped>
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  background-color: #f2f2f2;
  color: #333;
}

.title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 20px;
}

.project-list {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}

.project-card {
  background-color: #fff;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.project-name {
  font-weight: bold;
  font-size: 18px;
}

.project-description {
  color: #666;
  font-size: 14px;
}

.sprint-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #ccc;
}

.sprint-title {
  font-size: 20px;
  margin-bottom: 15px;
}

.sprint-list {
  list-style: none;
  padding: 0;
  margin-bottom: 15px;
}

.sprint-card {
  background-color: #fefefe;
  padding: 10px;
  border: 1px solid #bbb;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sprint-goal {
  font-size: 13px;
  color: #555;
}

.sprint-form {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sprint-form input {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #aaa;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 30%;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #28a745;
  color: white;
  margin-top: 10px;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.task-buttons {
  display: flex;
  gap: 10px;
  /* spacing between buttons */
  justify-content: flex-end;
  margin-top: 10px;
}

.task-buttons button {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.task-buttons .add-btn {
  background-color: green;
}

.task-buttons .delete-btn {
  background-color: red;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.task-buttons .view-btn {
  background-color: #17a2b8;
  color: white;
}
</style>
