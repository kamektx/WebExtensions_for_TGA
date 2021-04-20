class App {
  Messaging: Messaging;
  SendingObject: SendingObject;
  SendingJSON?: string;
  ErrorLog: string[];
  ChromiumOrGecko: ("Chromium" | "Gecko");
  constructor() {
    this.Messaging = new Messaging();
    this.SendingObject = new SendingObject();
    this.ErrorLog = new Array<string>();
    if ("sidebarAction" in browser) {
      this.ChromiumOrGecko = "Gecko";
    } else {
      this.ChromiumOrGecko = "Chromium";
    }
  }
}