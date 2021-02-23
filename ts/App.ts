class App {
  Messaging: Messaging;
  SendingObject: SendingObject;
  SendingJSON?: string;
  ErrorLog: string[];
  constructor() {
    this.Messaging = new Messaging();
    this.SendingObject = new SendingObject();
    this.ErrorLog = new Array<string>();
  }
}