class App {
  Messaging: Messaging;
  SendingObject!: SendingObject;
  SendingJSON?: string;
  ErrorLog: string[];
  ChromiumOrGecko: ("Chromium" | "Gecko");
  BrowserName?: string;
  ScreenCaptureTimer!: ScreenCaptureTimer;
  IsAppInited: boolean = false;

  AppInit = () => {
    if (this.IsAppInited) return;
    this.SendingObject = new SendingObject();
    this.ScreenCaptureTimer = new ScreenCaptureTimer();
    ActivateEvents();
    this.IsAppInited = true;
  }

  constructor() {
    if ("sidebarAction" in browser) {
      this.ChromiumOrGecko = "Gecko";
    } else {
      this.ChromiumOrGecko = "Chromium";
    }
    this.Messaging = new Messaging();
    this.ErrorLog = new Array<string>();
  }
}