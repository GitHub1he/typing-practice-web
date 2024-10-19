export class ReqMsg {
  constructor() {
    this.head = new Head();
    this.body = new Body();
  }
}

class Head {
  constructor() {
    this.msgType = 0; // 默认值
    this.msgContentType = "text"; // 默认值
    this.timestamp = Date.now(); // 默认值
    this.userId = 0; // 默认值
    this.access = ""; // 默认值
    this.roomId = ""; // 默认值
  }
}

class Body {
  constructor() {
    this.data = ""; // 默认值
    this.extend = ""; // 默认值
  }
}