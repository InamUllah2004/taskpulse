import { defineStore } from 'pinia'
import { Sprint } from './sprint' 

export const useSprintStore = defineStore('sprint', {
  state: () => ({
    sprints: JSON.parse(localStorage.getItem('sprints')) || []
  }),

  actions: {
    addSprint(name, goal, startDate, endDate) {
      const newSprint = new Sprint(name, goal, startDate, endDate)
      this.sprints.push(newSprint)
      this.saveToLocalStorage()
    },

    addTaskToSprint(sprintId, task) {
      const sprint = this.sprints.find(s => s.id === sprintId)
      if (sprint) {
        sprint.tasks.push(task)
        this.saveToLocalStorage()
      }
    },

    removeSprint(id) {
      this.sprints = this.sprints.filter(s => s.id !== id)
      this.saveToLocalStorage()
    },

    removeTaskFromSprint(sprintId, taskId) {
      const sprint = this.sprints.find(s => s.id === sprintId)
      if (sprint) {
        sprint.tasks = sprint.tasks.filter(t => t.id !== taskId)
        this.saveToLocalStorage()
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('sprints', JSON.stringify(this.sprints))
    }
  }
})
