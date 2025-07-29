export class Message {
  static messageID = Message.loadID();

  constructor(sender, content) {
    this.id = Message.messageID++;
    this.sender = sender;
    this.content = content;
    this.timestamp = new Date().toISOString(); // precise date/time
    Message.setID();
  }

  static loadID() {
    const id = localStorage.getItem("messageCount") ?? 1;
    return parseInt(id);
  }

  static setID() {
    localStorage.setItem("messageCount", Message.messageID);
  }
}
