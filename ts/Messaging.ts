interface MessageResponse {
  Command: ("ChangeTab" | "Received" | "BrowserName" | "CheckFocused"),
  WindowID?: number,
  TabID?: number,
  PageID?: number,
  ReceivedIndex?: number,
  BrowserName?: string
}

class Messaging {
  private Port!: browser.runtime.Port;
  private _Tasks: Map<number, object>;
  private _TaskIndex: number;
  private PostingIndex: number = 0;
  private ReceivedIndex: number = 0;
  private TickTime: number = 100;
  private TimeToReconnect: number = 10 * 1000;
  private TimerMilliSeconds: number = this.TimeToReconnect;
  private IsTimerRunning: boolean = false;
  private Disposed: boolean = false;
  private IsInitError: boolean = false;
  public ShouldReconnect: boolean = false;

  private ExecutePostMessage(obj: object, index: number) {
    console.log(`Posted a Message. Index: ${index}`);
    this.PostingIndex = index;
    this.Port.postMessage({ SendingIndex: index, Content: obj });
    this.TimerMilliSeconds = this.TimeToReconnect;
    if (!this.IsTimerRunning) {
      this.IsTimerRunning = true;
      this.VerifyReceivedTimer();
    }
  }

  private VerifyReceivedTimer = async (): Promise<boolean> => {
    while (this.TimerMilliSeconds > 0) {
      await Thread.Delay(this.TickTime);
      this.TimerMilliSeconds -= SendingObjectError.TickTime;
    }
    this.IsTimerRunning = false;
    if (this.PostingIndex == this.ReceivedIndex) return true;
    if (this.Disposed) return false;
    if (!this.ShouldReconnect) return false;
    console.log(" VerifyReceivedTimer is over. Trying Reconnect...")
    this.Disconnect();
    this.Reconnect();
    this.ReceivedIndex = this.PostingIndex;
    this.HandleNextTask();
    return false;
  }

  IsPortOK = (): boolean => {
    if (this.IsInitError) return false;
    if (this.Port.error != null) {
      console.log(this.Port.error?.message);
      return false;
    }
    return true;
  }

  PostMessage = (obj: object): void => {
    const myTaskIndex = ++this._TaskIndex;
    if (this.ReceivedIndex == myTaskIndex - 1) {
      this.ExecutePostMessage(obj, myTaskIndex);
      return;
    } else {
      this._Tasks.set(myTaskIndex, obj);
      return;
    }
  }

  HandleNextTask = (): void => {
    if (this.Disposed) return;
    if (this._Tasks.has(this.ReceivedIndex + 1)) {
      this.ExecutePostMessage(this._Tasks.get(this.ReceivedIndex + 1)!, this.ReceivedIndex + 1);
    }
  }

  private HandleReceived = (response: MessageResponse): void => {
    const receivedIndex = response.ReceivedIndex!;
    console.log("ReceivedIndex: " + receivedIndex);
    this.ReceivedIndex = receivedIndex;
    if (this._Tasks.has(this.ReceivedIndex)) {
      this._Tasks.delete(this.ReceivedIndex);
    }
    this.HandleNextTask();
  }

  private HandleBrowserName = (response: MessageResponse): void => {
    const browserName = response.BrowserName!;
    console.log("BrowserName: " + browserName);
    app.BrowserName = browserName;
    browser.storage.local.set({ BrowserName: browserName });
    initError = "";
    app.AppInit();
  }

  private ChangeTab = (response: MessageResponse): void => {
    const TabID = response.TabID!;
    const WindowID = response.WindowID!;
    console.log(response);
    if (app.SendingObject.ActiveWindowID != WindowID) {
      browser.windows.update(
        WindowID,              // integer
        {
          focused: true
        }           // object
      ).catch();
    }
    browser.tabs.update(
      TabID,
      {
        active: true
      }
    ).catch();
  }

  Dispose = (): void => {
    this.Disposed = true;
    this.Disconnect();
  }
  private Disconnect = (): void => {
    this.Port.disconnect();
  }

  Reconnect = (): void => {
    try {
      this.Port = browser.runtime.connectNative("tga_nativemessaging_cliant");
      this.Port.onDisconnect.addListener((port) => {
        console.log(browser.runtime.lastError?.message);
        this.IsInitError = true;
      });
      this.Port.onMessage.addListener((response) => {
        console.log("Message Received.");
        this.ShouldReconnect = true;
        const responseCasted = response as MessageResponse;
        const command = responseCasted.Command;
        switch (command) {
          case "Received":
            this.HandleReceived(responseCasted);
            break;
          case "ChangeTab":
            this.ChangeTab(responseCasted);
            break;
          case "BrowserName":
            this.HandleBrowserName(responseCasted);
            break;
          case "CheckFocused":
            console.log("CheckFocused");
            app.SendingObject.CheckFocused();
            break;
          default:
            break;
        }
      });
    } catch (e) {
      console.log(e);
      this.IsInitError = true;
    }
  }

  constructor() {
    this._Tasks = new Map();
    this._TaskIndex = 0;
    this.Reconnect();
  }
}