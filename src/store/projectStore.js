// import { defineStore } from 'pinia'
import { defineStore } from 'pinia'
import { Task } from './task'
import { Project } from './project' // adjust path if needed
export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: JSON.parse(localStorage.getItem('projects')) || []
  }),

  actions: {
    saveToLocalStorage() {
      localStorage.setItem('projects', JSON.stringify(this.projects))
    },

    toggleProjectOpen(id) {
      this.openProjectId = this.openProjectId === id ? null : id
    },
     addProject(name, description) {
       const newProject = new Project(name, description)
       this.projects.push(newProject)
       this.saveToLocalStorage()
     },

    addSprint(projectId, sprintData) {
      const project = this.projects.find(p => p.id === projectId)
      if (!project.sprints) project.sprints = []
      const sprint = {
        id: Date.now(),
        ...sprintData,
        tasks: [] // Initialize task array
      }
      project.sprints.push(sprint)
      this.saveToLocalStorage()
    },

    deleteSprint(projectId, sprintId) {
      const project = this.projects.find(p => p.id === projectId)
      if (project) {
        project.sprints = project.sprints.filter(s => s.id !== sprintId)
        this.saveToLocalStorage()
      }
    },

    addTaskToSprint(projectId, sprintId, title, description) {
      const project = this.projects.find(p => p.id === projectId)
      const sprint = project?.sprints?.find(s => s.id === sprintId)
      if (sprint) {
        const newTask = new Task(title, description)
        sprint.tasks.push(newTask)
        this.saveToLocalStorage()
      }
    },

    deleteTaskFromSprint(projectId, sprintId, taskId) {
      const project = this.projects.find(p => p.id === projectId)
      const sprint = project?.sprints?.find(s => s.id === sprintId)
      if (sprint) {
        sprint.tasks = sprint.tasks.filter(t => t.id !== taskId)
        this.saveToLocalStorage()
      }
    }
  }
})
