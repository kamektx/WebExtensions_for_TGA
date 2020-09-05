class App {
  Port: browser.runtime.Port;
  SendingObject: SendingObject;
  SendingJson?: string;
  ErrorLog: string[];
  constructor() {
    this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
    this.SendingObject = new SendingObject;
    this.ErrorLog = new Array<string>();
  }
}