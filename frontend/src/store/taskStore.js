import { defineStore } from 'pinia'
import { Task } from './task' // Adjust path if needed

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: JSON.parse(localStorage.getItem('tasks')) || []
  }),

  actions: {
    addTask(title, description, status = 'todo') {
      const newTask = new Task(title, description, status)
      this.tasks.push(newTask)
      this.saveToLocalStorage()
      return newTask // So we can also push this into a sprint
    },

    removeTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.saveToLocalStorage()
    },

    updateTaskStatus(id, status) {
      const task = this.tasks.find(t => t.id === id)
      if (task) {
        task.status = status
        this.saveToLocalStorage()
      }
    },

    saveToLocalStorage() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    }
  }
})
