export class Task {
  static taskID = Task.loadID()

  constructor(title, description, status = 'todo') {
    this.id = Task.taskID++
    this.title = title
    this.description = description
    this.status = status // todo, in-progress, done
    this.assignedTo = null // null by default, set when needed
    Task.setID()
  }

  static loadID() {
    const id = localStorage.getItem('taskCount') ?? 1
    return parseInt(id)
  }

  static setID() {
    localStorage.setItem('taskCount', Task.taskID)
  }
}
