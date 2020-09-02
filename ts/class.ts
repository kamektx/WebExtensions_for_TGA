class ScreenShot {
  ID?: string;
  Format?: ("jpeg" | "png")
  Data?: string;
  TabID?: number;
  URL?: string;
  toJSON() {
    return this.ID + "." + this.Format
  }
}

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