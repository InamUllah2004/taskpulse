import { defineStore } from 'pinia'
import { Team } from './team' // Make sure Team class handles structure

export const useTeamStore = defineStore('team', {
  state: () => ({
    teams: JSON.parse(localStorage.getItem('teams')) || []
  }),

  actions: {
    saveToLocalStorage() {
      localStorage.setItem('teams', JSON.stringify(this.teams))
    },

    addTeam(team) {
      const newTeam = new Team()
      newTeam.id = Date.now()
      newTeam.developers = [...team.developers] // expects full user objects
      newTeam.teamLead = team.teamLead          // expects full user object
      newTeam.assignedProjects = []
      newTeam.sprintAssignments = []
      this.teams.push(newTeam)
      console.log('➡️ New Team Created:', newTeam)
      this.saveToLocalStorage()
    },

    assignTeamLead(teamId, user) {
      const team = this.teams.find(t => t.id === teamId)
      if (team) {
        team.teamLead = user
        this.saveToLocalStorage()
      }
    },
    clearTeams() {
      this.teams = []                      // clear from memory
      localStorage.removeItem('teams')     // clear from localStorage
    },
    assignDeveloper(teamId, user) {
      const team = this.teams.find(t => t.id === teamId)
      if (team) {
        const index = team.developers.findIndex(dev => dev === null)
        if (index !== -1) {
          team.developers[index] = user
        } else if (team.developers.length < 4) {
          team.developers.push(user)
        } else {
          console.warn('Team already has 4 developers')
          return
        }
        this.saveToLocalStorage()
      }
    },

    removeDeveloper(teamId, userId) {
      const team = this.teams.find(t => t.id === teamId)
      if (team) {
        team.developers = team.developers.map(dev => dev?.id === userId ? null : dev)
        this.saveToLocalStorage()
      }
    },

    assignToProject(teamId, projectId) {
      const team = this.teams.find(t => t.id === teamId)
      if (team && !team.assignedProjects.includes(projectId)) {
        team.assignedProjects.push(projectId)
        this.saveToLocalStorage()
      }
    },

    assignSprintToDevelopers(teamId, projectId, sprintId, userIds) {
      const team = this.teams.find(t => t.id === teamId);
      if (!team) return;


      if (!Array.isArray(team.sprintAssignments)) {
        team.sprintAssignments = [];
      }

      let assignment = team.sprintAssignments.find(sa =>
        sa.projectId === projectId && sa.sprintId === sprintId
      );

      if (!assignment) {
        assignment = {
          projectId,
          sprintId,
          developerIds: []
        };
        team.sprintAssignments.push(assignment);
      }

      userIds.forEach(userId => {
        if (!assignment.developerIds.includes(userId)) {
          assignment.developerIds.push(userId);
        }
      });

      this.saveToLocalStorage();
    },
    getDisplayableTeams() {
      return this.teams.filter(team => {
        // Ensure team exists
        if (!team) return false;

        // Ensure lead is assigned and valid
        const hasValidLead = team.teamLead && team.teamLead.name && team.teamLead.name !== 'No lead assigned';

        // Ensure there's at least one valid developer
        const hasValidDeveloper = Array.isArray(team.developers) &&
          team.developers.some(dev => dev.name && dev.name !== 'Unnamed Developer');

        return hasValidLead || hasValidDeveloper;
      });
    },

    getAvailableDevelopers(teamId) {
      const team = this.teams.find(t => t.id === teamId);
      if (!team) return [];

      const assignedDevIds = new Set();

      // ✅ Loop over sprintAssignments array
      (team.sprintAssignments || []).forEach(assignment => {
        (assignment.developerIds || []).forEach(id => assignedDevIds.add(id));
      });

      return team.developers.filter(dev => dev && !assignedDevIds.has(dev.id));
    },
    getSprintAssignments(teamId) {
      const team = this.teams.find(t => t.id === teamId);
      return team ? team.sprintAssignments : [];
    },
    getSprintAssignments(teamId) {
      const team = this.teams.find(t => t.id === teamId)
      return team && Array.isArray(team.sprintAssignments)
        ? team.sprintAssignments
        : []
    }

  }
})

