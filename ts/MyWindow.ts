class MyWindow {
  readonly Ready2: Ready;
  IsActive: boolean;
  WindowID?: number;
  ActiveTabID?: number;
  RecentTabs: number[];
  TabsInOrder: number[];
  LastCapturedTab?: number;
  SendingObject: SendingObject;
  Tabs: MyTabs;

  // Verify = async (sizeCheck: boolean = false): Promise<boolean> => {
  //   if (await this.Ready === false || this.IsNotError === false) {
  //     this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
  //     this.IsNotError = false;
  //   }
  //   if (sizeCheck) {
  //     const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
  //     if (tabsInfo.length !== this.Tabs.size) {
  //       this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
  //       this.IsNotError = false;
  //     }
  //   }
  //   return this.IsNotError;
  // }

  Verify2 = async (): Promise<boolean> => {
    if (this.LastCapturedTab !== undefined && this.Tabs.has(this.LastCapturedTab!) === false) {
      this.LastCapturedTab = undefined;
    }
    if (this.Ready2.IsError) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      return false;
    }
    return true;
  }

  public ActiveTabChanged = async (tabID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      if (this.ActiveTabID !== undefined) {
        if (this.Tabs.has(this.ActiveTabID)) {
          const myTab = this.Tabs.get(this.ActiveTabID)!;
          await myTab.Ready2.AddWriteTask(async () => {
            myTab.IsActive = false;
            return true;
          });
        } else {
          return false;
        }
      }
      if (this.Tabs.has(tabID)) {
        const myTab = this.Tabs.get(tabID)!;
        await myTab.Ready2.AddWriteTask(async () => {
          myTab.IsActive = true;
          return true;
        });
        const index_RecentTabs = this.RecentTabs.indexOf(tabID);
        if (index_RecentTabs !== -1) {
          this.RecentTabs.splice(index_RecentTabs, 1);
        }
        this.RecentTabs.unshift(tabID);
      } else {
        return false;
      }
      this.ActiveTabID = tabID;
      return true;
    });
  }

  public CreateTab = async (tabInfo: browser.tabs.Tab): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      this.InsertTabInfo(tabInfo);
      return true;
    });
  }

  public RemoveTab = async (tabID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      return this.RemoveTabID(tabID);
    });
  }


  public AttachTab = async (tabID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      const tabInfo = await browser.tabs.get(tabID).catch(() => {
        return undefined;
      });
      if (tabInfo !== undefined) {
        this.InsertTabInfo(tabInfo);
      } else {
        return false;
      }
      return true;
    });
  }

  public DetachTab = async (tabID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      return this.RemoveTabID(tabID);
    });
  }

  public MoveTab = async (): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      this.TabsInOrder = new Array();
      const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
      for (const tabInfo of tabsInfo) {
        if (tabInfo.id !== undefined) {
          this.TabsInOrder[tabInfo.index] = tabInfo.id;
        } else {
          throw new Error("Couldn't get the TabID");
        }
      }
      return true;
    });
  }

  public ReplaceTab = async (addedTabID: number, removedTabID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      const result1 = this.RemoveTabID(removedTabID);
      if (this.Tabs.has(addedTabID)) {
        await this.Tabs.get(addedTabID)!.Update();
      } else {
        const tabInfo = await browser.tabs.get(addedTabID).catch(() => {
          return undefined;
        });
        if (tabInfo !== undefined) {
          this.InsertTabInfo(tabInfo);
        } else {
          return false;
        }
      }
      return result1;
    });
  }

  public UpdateTab = async (tabID: number): Promise<boolean> => {
    return await this.Ready2.AddReadTask(async (): Promise<boolean> => {
      if (this.Tabs.has(tabID) === false) {
        return false;
      } else {
        return await this.Tabs.get(tabID)!.Update();
      }
    });
  }

  public UpdateTabFavicon = async (tabID: number, faviconData: string): Promise<boolean> => {
    return await this.Ready2.AddReadTask(async (): Promise<boolean> => {
      if (this.Tabs.has(tabID) === false) {
        return false;
      } else {
        return await this.Tabs.get(tabID)!.SetFavicon(faviconData);
      }
    });
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
    return true;
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
      if (!this.Tabs.has(tabInfo.id)) {
        this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo));
        this.TabsInOrder.splice(tabInfo.index, 0, tabInfo.id);
      }
    } else {
      throw new Error("Couldn't get the TabID");
    }
  }
  RemoveTabID = (tabID: number): boolean => {
    const index_TabsInOrder = this.TabsInOrder.indexOf(tabID);
    const index_RecentTabs = this.RecentTabs.indexOf(tabID);
    if (index_TabsInOrder === -1 || this.Tabs.has(tabID) === false) {
      return false;
    } else {
      this.Tabs.get(tabID)!.destructor();
      this.Tabs.delete(tabID);
      this.TabsInOrder.splice(index_TabsInOrder, 1);
      if (index_RecentTabs !== -1) {
        this.RecentTabs.splice(index_RecentTabs, 1);
      }
      if (this.ActiveTabID === tabID) {
        this.ActiveTabID = undefined;
      }
    }
    return true;
  }

  public destructor = () => {
    this.Ready2.AddReadTask(async (): Promise<boolean> => {
      this.SendingObject.ReadyInstances.delete(this.Ready2);
      for (const myTab of this.Tabs.values()) {
        myTab.destructor();
      }
      return true;
    });
  }

  public constructor(arg: (number | browser.windows.Window)) {
    this.SendingObject = app.SendingObject;
    this.Ready2 = new Ready(this.SendingObject);
    this.IsActive = false;
    this.RecentTabs = new Array<number>();
    this.TabsInOrder = new Array<number>();
    this.Tabs = new MyTabs();
    this.SendingObject.ReadyInstances.add(this.Ready2);
    this.Ready2.AddVerifyTask(this.Verify2);
    this.Ready2.AddWriteTask(async (): Promise<boolean> => {
      let result: boolean;
      let windowInfo: browser.windows.Window | undefined;
      if (typeof arg === "number") {
        const windowID: number = arg;
        windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
          return undefined;
        });
      } else {
        windowInfo = arg;
      }
      if (windowInfo !== undefined) {
        result = await this.SetWindowInfo(windowInfo);
      } else {
        return false;
      }
      return result;
    }, "error");
    Object.defineProperties(this, {
      Ready2: { enumerable: false },
      SendingObject: { enumerable: false }
    });
  }
}
class MyWindows extends Map<number, MyWindow>{
  toJSON() {
    return [...this];
  }
}