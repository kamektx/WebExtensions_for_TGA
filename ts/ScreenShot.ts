class ScreenShot {
  static readonly Quality = 80;
  Ready: Promise<boolean>;
  IsReady: boolean;
  IsNotError: boolean;
  IsCaputured: boolean;
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
          b = ra[i] >> j;
        }
      } else {
        j = j - m;
        a >>= j;
      }
      const val = a + b;
      if (val < 2 ** m) {
        str += encodingTable[a + b];
      } else {
        throw new Error("Base32 encode error.");
      }
    }
    return str;
  }

  Capture = async (): Promise<boolean> => {
    this.IsCaputured = true;
    this.Data = await browser.tabs.captureVisibleTab(this.MyTab.WindowID!, { format: this.Format, quality: ScreenShot.Quality }).catch(() => {
      this.IsCaputured = false;
      return undefined;
    });
    if (this.IsCaputured === true) {
      this.CreateID();
    }
    return this.IsCaputured;
  }

  public Recapture = async (): Promise<boolean> => {
    if (await this.MyTab.Ready === false) {
      this.IsNotError = false;
    }
    if (this.TabURL !== this.MyTab.URL ||
      this.TabStatus !== this.MyTab.Status ||
      this.TabTitle !== this.MyTab.Title) {
      this.IsReady = false;
      this.Ready = (async () => {

        this.IsReady = true;
        return this.IsNotError;
      })();
    } else {
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
        await this.Capture();
      }
    }
    return this.IsNotError;
  }

  SetTabInformation = async (): Promise<boolean> => {
    if (await this.MyTab.Ready === false) {
      this.IsNotError = false;
    }
    this.TabID = this.MyTab.TabID;
    this.TabURL = this.MyTab.URL;
    this.TabStatus = this.MyTab.Status;
    this.TabTitle = this.MyTab.Title;
    return this.IsNotError;
  }

  public toJSON() {
    return this.ID + "." + this.Format;
  }
  ResetTimer() {
    this.ActiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureActiveWindow;
    this.FirstTimeMilliSeconds = ScreenCaptureTimer.TimeToRecaptureFirstTime;
    this.InactiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureInactiveWindow;
  }
  public constructor(myTab: MyTab) {
    this.Format = "jpeg"
    this.IsFirstTime = true;
    this.IsNotError = true;
    this.IsCaputured = true;
    this.ActiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureActiveWindow;
    this.FirstTimeMilliSeconds = ScreenCaptureTimer.TimeToRecaptureFirstTime;
    this.InactiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureInactiveWindow;
    this.SendingObject = app.SendingObject;
    this.MyTab = myTab;
    this.IsReady = false;
    this.Ready = (async () => {
      this.IsNotError = true;
      await this.Capture();
      this.IsReady = true;
      return this.IsNotError;
    })();
    this.SendingObject.ReadyInstances.add(this);
  }
}