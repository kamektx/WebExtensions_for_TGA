class MyTab {
  Ready: Promise<boolean>;
  IsReady: boolean;
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

  SetTabInfo = async (tabInfo: browser.tabs.Tab): Promise<boolean> => {
    this.IsActive = tabInfo.active;
    this.WindowID = tabInfo.windowId;
    this.TabID = tabInfo.id;
    this.Index = tabInfo.index;
    this.Title = tabInfo.title;
    this.URL = tabInfo.url;
    this.IsPinned = tabInfo.pinned;
    this.IsHidden = tabInfo.hidden;
    this.IsReady = true;
    return true;
  }
  constructor(myWindow: MyWindow, arg: (number | browser.tabs.Tab)) {
    this.IsReady = false;
    this.SendingObject = app.SendingObject;
    this.MyWindow = myWindow;
    if (typeof arg === "number") {
      const tabID: number = arg;
      const promiseTabInfo = browser.tabs.get(tabID);
      promiseTabInfo.catch((errMessage: string) => {
        this.Ready = Promise.resolve(false);
      });
      this.Ready = promiseTabInfo.then(this.SetTabInfo);
    } else {
      const tabInfo: browser.tabs.Tab = arg;
      this.Ready = this.SetTabInfo(tabInfo);
    }
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