class MyTab {
  readonly Ready2: Ready;
  IsActive?: boolean;
  WindowID?: number;
  TabID?: number;
  Status?: string;
  // Index?: number;
  ScreenShot?: ScreenShot;
  Title?: string;
  URL?: string;
  IsHidden?: boolean;
  IsPinned?: boolean;
  SendingObject: SendingObject;
  MyWindow: MyWindow;

  Verify = async (): Promise<boolean> => {
    if (this.Ready2.IsNotError === false) {
      this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
      return false;
    }
    return true;
  }

  Query = async (): Promise<browser.tabs.Tab | undefined> => {
    const tabInfo = await browser.tabs.get(this.TabID!).catch(() => {
      return undefined;
    });
    return tabInfo;
  }

  public Update = async (): Promise<boolean> => {
    return this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      const tabInfo = await this.Query();
      let result: boolean;
      if (tabInfo !== undefined) {
        return this.SetTabInfo(tabInfo);
      } else {
        return false;
      }
    });
  }

  SetTabInfo = (tabInfo: browser.tabs.Tab): boolean => {
    this.IsActive = tabInfo.active;
    this.WindowID = tabInfo.windowId;
    this.TabID = tabInfo.id;
    this.Status = tabInfo.status;
    this.Title = tabInfo.title;
    this.URL = tabInfo.url;
    this.IsPinned = tabInfo.pinned;
    this.IsHidden = tabInfo.hidden;
    return true;
  }

  public destructor = () => {
    this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      this.SendingObject.ReadyInstances.delete(this.Ready2);
      this.ScreenShot?.destructor();
      return true;
    });
  }

  public constructor(myWindow: MyWindow, arg: (number | browser.tabs.Tab)) {
    this.SendingObject = app.SendingObject;
    this.Ready2 = new Ready(this.SendingObject);
    this.Ready2.AddVerifyTask(this.Verify);
    this.SendingObject.ReadyInstances.add(this.Ready2);
    this.MyWindow = myWindow;
    this.Ready2.AddWriteTask(async () => {
      let tabInfo: browser.tabs.Tab | undefined;
      if (typeof arg === "number") {
        this.TabID = arg;
        tabInfo = await this.Query();
      } else {
        tabInfo = arg;
      }
      if (tabInfo !== undefined) {
        return this.SetTabInfo(tabInfo)
      } else {
        return false;
      }
    });
    Object.defineProperties(this, {
      Ready2: { enumerable: false },
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