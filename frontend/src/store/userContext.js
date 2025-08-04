import { ref } from 'vue'

// Singleton refs for current user email and role
const currentEmail = ref(localStorage.getItem('currentEmail') || '')
const currentRole = ref(localStorage.getItem('currentRole') || '')

// Keep localStorage in sync if changed via context
function setCurrentEmail(email) {
  currentEmail.value = email
  localStorage.setItem('currentEmail', email)
}
function setCurrentRole(role) {
  currentRole.value = role
  localStorage.setItem('currentRole', role)
}

export function useUserContext() {
  return {
    currentEmail,
    currentRole,
    setCurrentEmail,
    setCurrentRole
  }
}
