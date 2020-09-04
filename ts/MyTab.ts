class MyTab {
  Ready: Promise<boolean>;
  IsReady: boolean;
  IsNotError: boolean;
  IsActive?: boolean;
  WindowID?: number;
  TabID?: number;
  Index?: number;
  ScreenShot?: ScreenShot;
  Title?: string;
  URL?: string;
  IsHidden?: boolean;
  IsPinned?: boolean;
  SendingObject: SendingObject;
  MyWindow: MyWindow;

  Verify = async (): Promise<boolean> => {
    if (await this.Ready === false || this.IsNotError === false) {
      this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
      this.IsNotError = false;
    }
    return this.IsNotError;
  }
  Verify_DontWaitReady = async (): Promise<boolean> => {
    if (this.IsNotError === false) {
      this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
      this.IsNotError = false;
    }
    return this.IsNotError;
  }

  Query = async (): Promise<browser.tabs.Tab | undefined> => {
    const tabInfo = await browser.tabs.get(this.TabID!).catch(() => {
      this.IsNotError = false;
      return undefined;
    });
    return tabInfo;
  }

  public Update = async (): Promise<boolean> => {
    const isReady = await this.Ready;
    if (isReady === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      const tabInfo = await this.Query();
      if (tabInfo !== undefined) {
        this.IsNotError = await this.SetTabInfo(tabInfo);
      }
      this.IsReady = true;
      return this.IsNotError;
    })();
    return await this.Ready;
  }

  SetTabInfo = async (tabInfo: browser.tabs.Tab): Promise<boolean> => {
    this.IsActive = tabInfo.active;
    this.WindowID = tabInfo.windowId;
    this.TabID = tabInfo.id;
    this.Index = tabInfo.index;
    this.Title = tabInfo.title;
    this.URL = tabInfo.url;
    this.IsPinned = tabInfo.pinned;
    this.IsHidden = tabInfo.hidden;
    return true;
  }
  public constructor(myWindow: MyWindow, arg: (number | browser.tabs.Tab)) {
    this.IsNotError = true;
    this.SendingObject = app.SendingObject;
    this.MyWindow = myWindow;
    this.IsReady = false;
    this.Ready = (async () => {
      let tabInfo: browser.tabs.Tab | undefined;
      if (typeof arg === "number") {
        this.TabID = arg;
        tabInfo = await this.Query();
      } else {
        tabInfo = arg;
      }
      if (tabInfo !== undefined) {
        this.IsNotError = await this.SetTabInfo(tabInfo)
      } else {
        this.IsNotError = false;
      }
      this.IsReady = true;
      return await this.Verify_DontWaitReady();
    })();
    this.SendingObject.ReadyInstances.add(this);
    Object.defineProperties(this, {
      Ready: { enumerable: false },
      SendingObject: { enumerable: false },
      MyWindow: { enumerable: false }
    });
  }
}
class MyTabs extends Map<number, MyTab>{
  toJSON() {
    return [...this];
  }
}