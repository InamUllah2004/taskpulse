export class Sprint {
  static sprintID = Sprint.loadID()

  constructor(name, goal, startDate, endDate) {
    this.id = Sprint.sprintID++
    this.name = name
    this.goal = goal
    this.startDate = startDate
    this.endDate = endDate
    this.tasks = [] 
    Sprint.setID()
  }

  static loadID() {
    const id = localStorage.getItem('sprintCount') ?? 1
    return parseInt(id)
  }

  static setID() {
    localStorage.setItem('sprintCount', Sprint.sprintID)
  }

  addTask(task) {
    this.tasks.push(task)
  }

  removeTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId)
  }
}
