export class Team {
  static teamID = Team.loadID();

  constructor() {
    this.id = Team.teamID++;
    this.teamLead = null;
    this.developers = [];
    this.assignedProjects = [];
    this.sprintAssignments = []; 
    Team.setID();
  }

  static loadID() {
    const id = localStorage.getItem("teamCount");
    return id ? parseInt(id) : 1;
  }

  static setID() {
    localStorage.setItem("teamCount", Team.teamID);
  }
}
