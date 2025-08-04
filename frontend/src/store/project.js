export class Project {
  // Static variable for unique ID
  static projectID = Project.loadID();

  // Constructor
  constructor(name, description) {
    this.id = Project.projectID++;
    this.name = name;
    this.description = description;
    this.assignedTeam = null; 
    this.sprints = [];        
    this.progress = 0;
    Project.setID();
  }

  // Load last project ID from localStorage
  static loadID() {
    const id = localStorage.getItem("projectCount") ?? 1;
    return parseInt(id);
  }

  // Save updated project ID to localStorage
  static setID() {
    localStorage.setItem("projectCount", Project.projectID);
  }
}
