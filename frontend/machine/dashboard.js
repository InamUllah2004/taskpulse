// roleMachine.js
import { createMachine } from 'xstate'

export const roleMachine = createMachine({
  id: 'role',
  initial: 'idle',
  states: {
    idle: {
      on: {
        projectDirector: 'projectDirector',
        teamLead: 'teamLead',
        developer: 'developer',
        unauthorised: 'unauthorised'
      }
    },
    projectDirector: {
      on: {
        projectDirector: 'projectDirector' // optional self-loop
      }
    },
    teamLead: {
      on: {
        teamLead: 'teamLead'
      }
    },
    developer: {
      on: {
        developer: 'developer'
      }
    },
    unauthorised: {
      type: 'final'
    }
  }
})
