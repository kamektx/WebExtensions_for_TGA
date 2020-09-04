class MyWindow {
  Ready: Promise<boolean>;
  IsReady: boolean;
  IsNotError: boolean;
  IsActive: boolean;
  WindowID?: number;
  ActiveTabID?: number;
  RecentTabs: number[];
  TabsInOrder: number[];
  SendingObject: SendingObject;
  Tabs: MyTabs;
  Tabs2: MyTabs;

  Verify = async (): Promise<boolean> => {
    if (await this.Ready === false || this.IsNotError === false) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    if (tabsInfo.length !== this.Tabs.size) {
      this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    return this.IsNotError;
  }
  Verify_DontWaitReady = async (): Promise<boolean> => {
    if (this.IsNotError === false) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    if (tabsInfo.length !== this.Tabs.size) {
      this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    return this.IsNotError;
  }

  public ActiveTabChanged = async (tabID: number) => {
    const isNotError = await this.Ready;
    if (isNotError === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      if (this.ActiveTabID !== undefined && this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID)!.Ready) {
        this.Tabs.get(this.ActiveTabID)!.IsActive = false;
      } else {
        this.IsNotError = false;
      }
      if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID)!.Ready) {
        this.Tabs.get(tabID)!.IsActive = true;
      } else {
        this.IsNotError = false;
      }
      this.ActiveTabID = tabID;
      this.IsReady = true;
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  public CreateTab = async (tabInfo: browser.tabs.Tab) => {
    const isNotError = await this.Ready;
    if (isNotError === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.InsertTabInfo(tabInfo);
      for (const tabInfo of this.Tabs.values()) {
        tabInfo.Update();
      }
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  SetWindowInfo = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    if (windowInfo.type !== "normal") {
      throw new Error("This window type is not normal.");
    }
    this.WindowID = windowInfo.id;
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    for (const tabInfo of tabsInfo) {
      this.SetTabInfo(tabInfo)
    }
    this.IsReady = true;
    return this.IsReady;
  }
  SetTabInfo = (tabInfo: browser.tabs.Tab) => {
    if (tabInfo.id !== undefined) {
      this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
      this.TabsInOrder[tabInfo.index] = tabInfo.id;
    } else {
      throw new Error("Couldn't get the TabID");
    }
  }
  InsertTabInfo = (tabInfo: browser.tabs.Tab) => {
    if (tabInfo.id !== undefined) {
      this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
      this.TabsInOrder.splice(tabInfo.index, 0, tabInfo.id);
    } else {
      throw new Error("Couldn't get the TabID");
    }
  }
  public constructor(arg: (number | browser.windows.Window)) {
    this.IsNotError = true;
    this.IsActive = false;
    this.RecentTabs = new Array<number>();
    this.TabsInOrder = new Array<number>();
    this.Tabs = new MyTabs();
    this.Tabs2 = new MyTabs();
    this.SendingObject = app.SendingObject;
    this.IsReady = false;
    this.Ready = (async () => {
      if (typeof arg === "number") {
        const windowID: number = arg;
        const windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
          this.IsNotError = false;
          return undefined;
        });
        if (windowInfo !== undefined) {
          await this.SetWindowInfo(windowInfo);
        }
      } else {
        const windowInfo: browser.windows.Window = arg;
        await this.SetWindowInfo(windowInfo);
      }
      this.IsNotError = await this.Verify_DontWaitReady();
      this.IsReady = true;
      return this.IsNotError;
    })();
    this.SendingObject.ReadyInstances.add(this);
    Object.defineProperties(this, {
      Ready: { enumerable: false },
      Tabs2: { enumerable: false },
      SendingObject: { enumerable: false }
    });
  }
}
class MyWindows extends Map<number, MyWindow>{
  toJSON() {
    return [...this];
  }
}