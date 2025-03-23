export class Msg {
  constructor() {
    this.head = new Head();
    this.body = new Body();
    this.sender = new Sender();
  }
  // toJSON() {
  //   return JSON.stringify(this);
  // }
}

class Head {
  constructor() {
    this.msgType = 0;
    this.msgContentType = 0;
    this.timestamp = 0;
    this.statusReport = 0;
    this.access = "";
  }
}

class Body {
  constructor() {
    this.receiveId = "";
    this.msgContent = "";
    this.extend = "";
  }
}

class Sender {
  constructor() {
    this.userId = 0;
    this.name = "";
    this.avatar = "";
    this.extend = "";
  }
}
