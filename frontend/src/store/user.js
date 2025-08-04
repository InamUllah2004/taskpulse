export class User {
    //Static varible for ID
    static userID=User.loadID();
  
  //Constructor//
    constructor(name, email,password,role) {
    this.id = User.userID++;
    this.name = name;
    this.email = email;
    this.password=password;
    this.role=role;
    this.available = 0;
    User.setID();
  }
  //Getter Function
  static loadID(){
  const id=localStorage.getItem("userCount") ?? 1;
  return parseInt(id);  
  } 
  //Setter Function 
  static setID(){
    localStorage.setItem("userCount",User.userID);
  }
}

