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

  Verify = async (sizeCheck: boolean = false): Promise<boolean> => {
    if (await this.Ready === false || this.IsNotError === false) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    if (sizeCheck) {
      const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
      if (tabsInfo.length !== this.Tabs.size) {
        this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
        this.IsNotError = false;
      }
    }
    return this.IsNotError;
  }
  Verify_DontWaitReady = async (sizeCheck: boolean = false): Promise<boolean> => {
    if (this.IsNotError === false) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      this.IsNotError = false;
    }
    if (sizeCheck) {
      const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
      if (tabsInfo.length !== this.Tabs.size) {
        this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
        this.IsNotError = false;
      }
    }
    return this.IsNotError;
  }

  public ActiveTabChanged = async (tabID: number): Promise<boolean> => {
    const isNotError = await this.Ready;
    if (isNotError === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      if (this.ActiveTabID !== undefined) {
        if (this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID)!.Ready) {
          this.Tabs.get(this.ActiveTabID)!.IsActive = false;
        } else {
          this.IsNotError = false;
        }
      }
      if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID)!.Ready) {
        this.Tabs.get(tabID)!.IsActive = true;
        const index_RecentTabs = this.RecentTabs.indexOf(tabID);
        if (index_RecentTabs !== -1) {
          this.RecentTabs.splice(index_RecentTabs, 1);
        }
        this.RecentTabs.unshift(tabID);
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

  public CreateTab = async (tabInfo: browser.tabs.Tab): Promise<boolean> => {
    const isNotError = await this.Ready;
    if (isNotError === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.InsertTabInfo(tabInfo);
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  public RemoveTab = async (tabID: number): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.RemoveTabID(tabID);
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }


  public AttachTab = async (tabID: number): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      const tabInfo = await browser.tabs.get(tabID).catch(() => {
        this.IsNotError = false;
        return undefined;
      });
      if (tabInfo !== undefined) {
        this.InsertTabInfo(tabInfo);
      }
      for (const tabInfo2 of this.Tabs.values()) {
        tabInfo2.Update();
      }
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  public DetachTab = async (tabID: number): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.RemoveTabID(tabID);
      for (const tabInfo2 of this.Tabs.values()) {
        tabInfo2.Update();
      }
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  public MoveTab = async (): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.TabsInOrder = new Array();
      const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
      for (const tabInfo of tabsInfo) {
        if (tabInfo.id !== undefined) {
          this.TabsInOrder[tabInfo.index] = tabInfo.id;
        } else {
          throw new Error("Couldn't get the TabID");
        }
      }
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify(true);
  }

  public ReplaceTab = async (addedTabID: number, removedTabID: number): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    this.IsReady = false;
    this.Ready = (async () => {
      this.RemoveTabID(removedTabID);
      if (this.Tabs.has(addedTabID)) {
        await this.Tabs.get(addedTabID)!.Update();
      } else {
        const tabInfo = await browser.tabs.get(addedTabID).catch(() => {
          this.IsNotError = false;
          return undefined;
        });
        if (tabInfo !== undefined) {
          this.InsertTabInfo(tabInfo);
        }
      }
      return this.IsNotError;
    })();
    await this.Ready;
    return await this.Verify();
  }

  public UpdateTab = async (tabID: number): Promise<boolean> => {
    if (await this.Ready === false) {
      return false;
    }
    if (this.Tabs.has(tabID) === false) {
      this.IsNotError = false;
    } else {
      this.Tabs.get(tabID)!.Update();
    }
    return await this.Verify();
  }


  SetWindowInfo = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    if (windowInfo.type !== "normal") {
      throw new Error("This window type is not normal.");
    }
    this.WindowID = windowInfo.id;
    this.IsActive = windowInfo.focused;
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    for (const tabInfo of tabsInfo) {
      this.SetTabInfo(tabInfo);
    }
    return this.IsNotError;
  }
  SetTabInfo = (tabInfo: browser.tabs.Tab) => {
    if (tabInfo.id !== undefined) {
      this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo));
      this.TabsInOrder[tabInfo.index] = tabInfo.id;
      if (tabInfo.active) {
        this.ActiveTabID = tabInfo.id;
        this.RecentTabs.unshift(tabInfo.id);
      }
    } else {
      throw new Error("Couldn't get the TabID");
    }
  }
  InsertTabInfo = (tabInfo: browser.tabs.Tab) => {
    if (tabInfo.id !== undefined) {
      this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo));
      this.TabsInOrder.splice(tabInfo.index, 0, tabInfo.id);
    } else {
      throw new Error("Couldn't get the TabID");
    }
  }
  RemoveTabID = (tabID: number) => {
    const index_TabsInOrder = this.TabsInOrder.indexOf(tabID);
    const index_RecentTabs = this.RecentTabs.indexOf(tabID);
    if (index_TabsInOrder === -1 || this.Tabs.has(tabID) === false) {
      this.IsNotError = false;
    } else {
      this.SendingObject.ReadyInstances.delete(this.Tabs.get(tabID)!);
      this.Tabs.delete(tabID);
      this.TabsInOrder.splice(index_TabsInOrder, 1);
      if (index_RecentTabs !== -1) {
        this.RecentTabs.splice(index_RecentTabs, 1);
      }
      if (this.ActiveTabID === tabID) {
        this.ActiveTabID = undefined;
      }
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
      let windowInfo: browser.windows.Window | undefined;
      if (typeof arg === "number") {
        const windowID: number = arg;
        windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
          this.IsNotError = false;
          return undefined;
        });
      } else {
        windowInfo = arg;
      }
      if (windowInfo !== undefined) {
        await this.SetWindowInfo(windowInfo);
      }
      this.IsNotError = await this.Verify_DontWaitReady(true);
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