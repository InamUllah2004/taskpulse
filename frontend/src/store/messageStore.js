import { defineStore } from 'pinia'
import { Message } from './message' // adjust the path as needed

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: JSON.parse(localStorage.getItem('messages')) || []
  }),

  actions: {
    addMessage(sender, content) {
      const newMessage = new Message(sender, content)
      this.messages.push(newMessage)
      this.saveToLocalStorage()
    },

    removeMessage(id) {
      this.messages = this.messages.filter(m => m.id !== id)
      this.saveToLocalStorage()
    },

    clearMessages() {
      this.messages = []
      localStorage.removeItem('messages')
      localStorage.removeItem('messageCount')
    },

    saveToLocalStorage() {
      localStorage.setItem('messages', JSON.stringify(this.messages))
    },

    seedMessages() {
      if (this.messages.length === 0) {
        this.addMessage("System", "Welcome to the message board!")
        this.addMessage("Inam", "Let's get started on this project.")
      }
    }
  }
})
