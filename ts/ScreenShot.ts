class ScreenShot {
  static readonly Quality = 30;
  readonly Ready2: Ready;
  IsCaputured: boolean;
  CannotCapture: boolean;
  ID?: string;
  Format: ("jpeg" | "png")
  Data?: string;
  TabID?: number;
  TabURL?: string;
  TabStatus?: string;
  TabTitle?: string;
  ActiveWindowMilliSeconds: number;
  FirstTimeMilliSeconds: number;
  InactiveWindowMilliSeconds: number;
  IsFirstTime: boolean;
  SendingObject: SendingObject;
  MyTab: MyTab;

  CreateID() {
    const randomArray = new Uint32Array(4);
    window.crypto.getRandomValues(randomArray);
    this.ID = this.EncodeBase32(randomArray);
  }

  EncodeBase32(randomArray: Uint32Array): string {
    const encodingTable: string[] = [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
      'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
      'Y', 'Z', '2', '3', '4', '5', '6', '7'
    ];
    let str = "";
    const ra = randomArray;
    const m = 5;
    const n = 32;
    const l = ra.length;
    let i = 0;
    let j = n;
    while (i < l) {
      let a = ra[i] % (2 ** j);
      let b = 0;
      if (j - m < 0) {
        a <<= m - j;
        i++;
        if (i < l) {
          j = j - m + n;
          b = ra[i] >>> j;
        }
      } else {
        j = j - m;
        a >>>= j;
      }
      const val = a + b;
      if (val < 2 ** m) {
        str += encodingTable[val];
      } else {
        throw new Error("Base32 encode error.");
      }
    }
    return str;
  }

  public Capture = async (): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      await this.SetTabInformation();
      this.IsCaputured = true;
      this.CannotCapture = false;
      this.Data = await browser.tabs.captureVisibleTab(this.MyTab.WindowID!, { format: this.Format, quality: ScreenShot.Quality }).catch((err) => {
        this.IsCaputured = false;
        if ((err?.message as string) === "The \'activeTab\' permission is not in effect because this extension has not been in invoked.") {
          this.CannotCapture = true;
        }
        return undefined;
      });
      if (this.IsCaputured || (this.CannotCapture && this.IsFirstTime)) {
        this.CreateID();
      }
      this.ResetTimer();
      this.SendJSON(); // DON'T AWAIT!!
      return this.IsCaputured;
    }, "ignore");
  }

  CheckTabUpdated = async (): Promise<boolean> => {
    return this.MyTab.Ready2.AddReadTask(async () => {
      return this.TabURL !== this.MyTab.URL ||
        this.TabStatus !== this.MyTab.Status ||
        this.TabTitle !== this.MyTab.Title;
    }, "ignore", "quit", "ScreenShot.CheckTabUpdated()");
  }

  public Recapture = async (): Promise<boolean> => {
    return await this.Ready2.AddReadTask(async () => {
      if (await this.CheckTabUpdated()) {
        this.IsFirstTime = true;
        this.Capture();
        return true;
      }
      if (!this.IsCaputured && !this.CannotCapture) {
        this.IsFirstTime = true;
        this.Capture(); // DON'T AWAIT!!
        return true;
      }
      if (this.IsFirstTime) {
        this.FirstTimeMilliSeconds -= ScreenCaptureTimer.TickTime;
      } else if (this.MyTab.WindowID === this.SendingObject.ActiveWindowID) {
        this.ActiveWindowMilliSeconds -= ScreenCaptureTimer.TickTime;
      } else {
        this.InactiveWindowMilliSeconds -= ScreenCaptureTimer.TickTime;
      }
      if (this.FirstTimeMilliSeconds <= 0 ||
        this.ActiveWindowMilliSeconds <= 0 ||
        this.InactiveWindowMilliSeconds <= 0) {
        this.IsFirstTime = false;
        this.Capture();
        return true;
      }
      return true;
    }, "error", "quit", "ScreenShot.Recapture()");

  }

  SetTabInformation = async (): Promise<boolean> => {
    return await this.MyTab.Ready2.AddReadTask(async () => {
      this.TabID = this.MyTab.TabID;
      this.TabURL = this.MyTab.URL;
      this.TabStatus = this.MyTab.Status;
      this.TabTitle = this.MyTab.Title;
      return true;
    }, "error", "quit", "ScreenShot.SetTabInformation()");
  }

  public toJSON() {
    return this.ID + "." + this.Format;
  }

  public SendJSON = async (): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      if (this.IsCaputured) {
        const obj = {
          Type: "ScreenShot",
          FileName: this.ID + "." + this.Format,
          Data: this.Data
        }
        app.Messaging.PostMessage(obj);
        this.MyTab.MyWindow.LastCapturedTab = this.MyTab.TabID;
        this.Data = "";
        console.log("Sent ScreenShot");
      } else if (this.CannotCapture) {
        const obj = {
          Type: "CannotCaptureScreenShot",
          FileName: this.ID + "." + this.Format,
          Title: this.TabTitle
        }
        app.Messaging.PostMessage(obj);
        console.log("Sent CannotCaptureScreenShot");
      }
      return true;
    });
  }

  ResetTimer() {
    this.ActiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureActiveWindow;
    this.FirstTimeMilliSeconds = ScreenCaptureTimer.TimeToRecaptureFirstTime;
    this.InactiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureInactiveWindow;
  }

  public destructor = () => {
    this.Ready2.AddReadTask(async () => {
      this.SendingObject.ReadyInstances.delete(this.Ready2);
      return true;
    });
  }

  public constructor(myTab: MyTab) {
    this.Format = "jpeg"
    this.IsFirstTime = true;
    this.IsCaputured = true;
    this.ActiveWindowMilliSeconds = 0;
    this.FirstTimeMilliSeconds = 0;
    this.InactiveWindowMilliSeconds = 0;
    this.SendingObject = app.SendingObject;
    this.Ready2 = new Ready(this.SendingObject, this);
    this.SendingObject.ReadyInstances.add(this.Ready2);
    this.MyTab = myTab;
    this.CannotCapture = false;
    this.Capture();
  }
}