class SendingObject {
  Ready2: Ready;
  readonly Type = "SendingObject";
  ActiveWindowID: number | undefined;
  Arrangements: Arrangements;
  Windows: MyWindows;
  UnmanagedWindows: Set<number>;
  ReadyInstances: ReadyInstances;
  Error: SendingObjectError;

  public FindWindowWhichHasTheTabID = async (tabID: number): Promise<(MyWindow | undefined)> => {
    const result = await this.Ready2.AddReadTaskAny(async (): Promise<MyWindow | undefined> => {
      const activeWindowID = this.ActiveWindowID;
      if (activeWindowID !== undefined) {
        if (this.Windows.has(activeWindowID)) {
          const myWindow = this.Windows.get(activeWindowID)!;
          if (await myWindow.Ready2.AddReadTask(async () => myWindow.Tabs.has(tabID), "ignore")) {
            return myWindow;
          }
        } else {
          this.Ready2.AddWriteTask(async () => false); //ForErrorNotification
          return undefined;
        }
      }
      for (const myWindow of this.Windows.values()) {
        if (await myWindow.Ready2.AddReadTask(async () => myWindow.Tabs.has(tabID), "ignore")) {
          return myWindow;
        }
      }
      return undefined;
    });
    return result;
  }

  public HasWindowID = async (windowID: number): Promise<("false" | "managed" | "unmanaged")> => {
    return await this.Ready2.AddReadTaskAny(async (): Promise<("false" | "managed" | "unmanaged")> => {
      if (this.Windows.has(windowID)) {
        return "managed";
      } else if (this.UnmanagedWindows.has(windowID)) {
        return "unmanaged";
      } else {
        return "false";
      }
    }) ?? "false";
  }

  SetWindowsInfo = async (windowsInfo: browser.windows.Window[]): Promise<boolean> => {
    for (const windowInfo of windowsInfo) {
      if (windowInfo.id === undefined) {
        throw new Error();
      }
      if (windowInfo.type !== "normal") {
        this.UnmanagedWindows.add(windowInfo.id);
      } else {
        this.Windows.set(windowInfo.id, new MyWindow(windowInfo));
        if (windowInfo.focused) {
          this.ActiveWindowID = windowInfo.id;
        }
      }
    }
    return true;
  }


  Verify = async (): Promise<boolean> => {
    if (this.Ready2.IsNotError === false) {
      this.Error.ThrowError("Sending Object");
      return false;
    }
    // const windowsInfo = await browser.windows.getAll({ populate: false });
    // if (windowsInfo.length !== this.Windows.size + this.UnmanagedWindows.size) {
    //   this.Error.ThrowError("Sending Object : The number of windows won't match.");
    //   return false;
    // }
    return true;
  }

  public AddWindow = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      return this.SetWindowsInfo([windowInfo]);
    });
  }
  public RemoveWindow = async (windowID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      this.UnmanagedWindows.delete(windowID);
      if (this.Windows.has(windowID)) {
        if (this.ActiveWindowID === windowID) {
          this.ActiveWindowID = undefined;
        }
        this.Windows.get(windowID)!.destructor();
        this.Windows.delete(windowID);
      }
      return true;
    });
  }
  public FocusChanged = async (windowID: number): Promise<boolean> => {
    return await this.Ready2.AddWriteTask(async () => {
      if (this.ActiveWindowID !== undefined) {
        if (this.Windows.has(this.ActiveWindowID)) {
          const myWindow = this.Windows.get(this.ActiveWindowID)!;
          myWindow.Ready2.AddWriteTask(async () => {
            myWindow.IsActive = false;
            return true;
          });
        } else {
          return false;
        }
      }
      if (this.Windows.has(windowID)) {
        const myWindow = this.Windows.get(windowID)!;
        myWindow.Ready2.AddWriteTask(async () => {
          myWindow.IsActive = true;
          return true;
        });
        this.ActiveWindowID = windowID;
      } else {
        this.ActiveWindowID = undefined;
      }
      return true;
    });
  }

  public ChangeOccured = async () => {
    this.ReadyInstances.PrepareSending();
  }

  public constructor() {
    this.Ready2 = new Ready(this, this);
    this.Ready2.AddVerifyTask(this.Verify);
    this.ActiveWindowID = undefined;
    this.Arrangements = new Arrangements();
    this.Windows = new MyWindows();
    this.UnmanagedWindows = new Set<number>();
    this.Error = new SendingObjectError(this);
    this.ReadyInstances = new ReadyInstances(this);
    this.ReadyInstances.add(this.Ready2);
    this.Ready2.AddWriteTask(async () => {
      const windowsInfo = await browser.windows.getAll({ populate: false }).catch(() => {
        return undefined;
      });
      if (windowsInfo !== undefined) {
        return await this.SetWindowsInfo(windowsInfo);
      } else {
        return false;
      }
    });
    Object.defineProperties(this, {
      Ready2: { enumerable: false },
      Error: { enumerable: false },
      UnmanagedWindows: { enumerable: false },
      ReadyInstances: { enumerable: false }
    });
  }
}