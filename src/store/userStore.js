import { defineStore } from 'pinia'
import { User } from './user' // Adjust the path if needed

export const useUserStore = defineStore('user', {
  state: () => ({
    users: JSON.parse(localStorage.getItem('users')) || [],
    currentEmail: '',
    currentRole: ''
  }),

  actions: {
    addUser(name, email, password, role) {
      const newUser = new User(name, email, password, role)
      this.users.push(newUser)
      this.saveToLocalStorage()
    },

    removeUser(id) {
      this.users = this.users.filter(u => u.id !== id)
      this.saveToLocalStorage()
    },

    saveToLocalStorage() {
      localStorage.setItem('users', JSON.stringify(this.users))
    },
    updateAvailability(id, available) {
      const user = this.users.find(u => u.id === id)
      if (user) {
        user.available = available
        this.saveToLocalStorage()
      }
    },

    seedAdmin() {
      const hasAdmin = this.users.some(u => u.role === 'admin')
      if (!hasAdmin) {
        const defaultAdmin = new User('Admin', 'admin@gmail.com', 'Admin123', 'admin')
        this.users.push(defaultAdmin)
        this.saveToLocalStorage()
      }
    }
  }
})
