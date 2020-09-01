const DirectionArray = [
  "Down",
  "Up",
  "Right",
  "Left"
] as const;
type Direction = typeof DirectionArray[number];
class RowSetting {
  Type: string;
  MaxColumns: number;
  constructor(myType: string = "", maxColumns: number = 0) {
    this.Type = myType;
    this.MaxColumns = maxColumns;
  }
}
class ColumnSetting {
  Row: RowSetting;
  Size: string;
  constructor(row: RowSetting = new RowSetting(), size: string = "big") {
    this.Size = size;
    this.Row = row;
  }
}
class StartPosition {
  Row: number;
  Column: number;
  constructor(row: number = 0, column: number = 0) {
    this.Column = column;
    this.Row = row;
  }
}
class Arrangement {
  Column: ColumnSetting[];
  StartPosition: StartPosition;
  constructor(startPosition: StartPosition = new StartPosition()) {
    this.Column = new Array<ColumnSetting>();
    this.StartPosition = startPosition;
  }
}
class HandleDirection {
  Down = false;
  Up = false;
  Right = false;
  Left = false;
}
class Arrangements {
  Down?: Arrangement;
  Up?: Arrangement;
  Right?: Arrangement;
  Left?: Arrangement;
  HandleDirection: HandleDirection;
  constructor() {
    this.HandleDirection = new HandleDirection();
  }
  AddDirection(arrangement: Arrangement, direction: Direction, overWrite = false): boolean {
    if (this.HandleDirection[direction] && !overWrite) {
      return false;
    }
    this.HandleDirection[direction] = true;
    this[direction] = arrangement;
    return true;
  }
  RemoveDirecton(direction: Direction): boolean {
    if (!this.HandleDirection[direction]) {
      return false;
    }
    this.HandleDirection[direction] = false;
    this[direction] = undefined;
    return true;
  }
}
class ScreenShot {
  ID?: string;
  Format?: ("jpeg" | "png")
  Data?: string;
  TabID?: number;
  URL?: string;
  toJSON() {
    return this.ID + "." + this.Format
  }
}
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
    this.SendingObject.Readies.add(this.Ready);
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
class MyWindow {
  Ready: Promise<boolean>;
  IsReady: boolean;
  IsActive: boolean;
  WindowID?: number;
  ActiveTabID?: number;
  RecentTabs: number[];
  TabsInOrder: number[];
  SendingObject: SendingObject;
  Tabs: MyTabs;
  Tabs2: MyTabs;

  Verify = async (): Promise<boolean> => {
    if (await this.Ready === false) {
      this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
      this.IsReady = false;
      return false;
    }
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    if (tabsInfo.length !== this.Tabs.size) {
      this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
      this.IsReady = false;
      return false;
    }
    return true;
  }

  ActiveTabChanged = async (tabID: number) => {
    const isReady = await this.Ready;
    this.IsReady = false;
    if (isReady === false) {
      return false;
    }
    this.Ready = (async () => {
      if (this.ActiveTabID !== undefined && this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID)!.Ready) {
        this.Tabs.get(this.ActiveTabID)!.IsActive = false;
      } else {
        return false;
      }
      if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID)!.Ready) {
        this.Tabs.get(tabID)!.IsActive = true;
      } else {
        return false;
      }
      this.ActiveTabID = tabID;
      this.IsReady = true;
      return true;
    })();
    return await this.Ready && await this.Verify();
  }

  SetWindowInfo = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    if (windowInfo.type !== "normal") {
      throw new Error("This window type is not normal.");
    }
    this.WindowID = windowInfo.id;
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    for (const tabInfo of tabsInfo) {
      if (tabInfo.id !== undefined) {
        this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
        this.TabsInOrder[tabInfo.index] = tabInfo.id;
      } else {
        throw new Error("Couldn't get the TabID");
      }
    }
    this.IsReady = true;
    return true;
  }
  constructor(arg: (number | browser.windows.Window)) {
    this.IsReady = false;
    this.IsActive = false;
    this.RecentTabs = new Array<number>();
    this.TabsInOrder = new Array<number>();
    this.Tabs = new MyTabs();
    this.Tabs2 = new MyTabs();
    this.SendingObject = app.SendingObject;
    if (typeof arg === "number") {
      const windowID: number = arg;
      const promiseWindowInfo = browser.windows.get(windowID, { populate: false });
      promiseWindowInfo.catch((errMessage: string) => {
        this.Ready = Promise.resolve(false);
      });
      this.Ready = promiseWindowInfo.then(this.SetWindowInfo);
    } else {
      const windowInfo: browser.windows.Window = arg;
      this.Ready = this.SetWindowInfo(windowInfo);
    }
    this.SendingObject.Readies.add(this.Ready);
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

class SendingObject {
  Ready: Promise<boolean>;
  IsReady: boolean;
  ActiveWindowID?: number;
  Arrangements: Arrangements;
  Windows: MyWindows;
  NoManageWindows: Set<number>;
  Error: SendingObjectError;
  Readies: Set<Promise<boolean>>;

  SetWindowsInfo = async (windowsInfo: browser.windows.Window[]): Promise<boolean> => {
    if (windowsInfo.length === 0) {
      return false;
    }
    for (const windowInfo of windowsInfo) {
      if (windowInfo.id === undefined) {
        this.IsReady = false;
        return false;
      }
      if (windowInfo.type !== "normal") {
        this.NoManageWindows.add(windowInfo.id!);
      } else {
        if (windowInfo.id !== undefined) {
          // if(this.Windows.has(windowInfo.id)){
          //   this.Windows.set(windowInfo.id, new MyWindow(windowInfo));
          //   if(windowInfo.focused){
          //     this.ActiveWindowID = windowInfo.id;
          //   }   
          // }
          this.Windows.set(windowInfo.id, new MyWindow(windowInfo));
          if (windowInfo.focused) {
            this.ActiveWindowID = windowInfo.id;
          }
        }
      }
    }
    this.IsReady = true;
    return true;
  }
  Verify = async (): Promise<boolean> => {
    if (await this.Ready === false) {
      this.Error.ThrowError("Sending Object");
      this.IsReady = false;
      return false;
    }
    const windowsInfo = await browser.windows.getAll({ populate: false });
    if (windowsInfo.length !== this.Windows.size + this.NoManageWindows.size) {
      this.Error.ThrowError("Sending Object : The number of windows won't match.");
      this.IsReady = false;
      return false;
    }
    return true;
  }
  AddWindow = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    const isReady = await this.Ready;
    this.IsReady = false;
    if (isReady === false) {
      return false;
    }
    this.Ready = this.SetWindowsInfo([windowInfo]);
    return await this.Ready && await this.Verify();
  }
  RemoveWindow = async (windowID: number): Promise<boolean> => {
    const isReady = await this.Ready;
    if (isReady === false) {
      return false;
    }
    this.NoManageWindows.delete(windowID);
    this.Windows.delete(windowID);
    this.IsReady = await this.Verify();
    return this.IsReady;
  }
  FocusChanged = async (windowID: number): Promise<boolean> => {
    const isReady = await this.Ready;
    this.IsReady = false;
    if (isReady === false) {
      return false;
    }
    this.Ready = (async () => {
      if (this.ActiveWindowID !== undefined) {
        if (this.Windows.get(this.ActiveWindowID) !== undefined && await this.Windows.get(this.ActiveWindowID)!.Ready) {
          this.Windows.get(this.ActiveWindowID)!.IsActive = false;
        } else {
          return false;
        }
      }
      if (this.NoManageWindows.has(windowID)) {
        this.ActiveWindowID = undefined;
      } else {
        if (this.Windows.get(windowID) !== undefined && await this.Windows.get(windowID)!.Ready) {
          this.Windows.get(windowID)!.IsActive = true;
          this.ActiveWindowID = windowID;
        } else {
          return false;
        }
      }
      this.IsReady = true;
      return true;
    })();
    return await this.Ready && await this.Verify();
  }
  constructor() {
    this.IsReady = false;
    this.ActiveWindowID = -1;
    this.Arrangements = new Arrangements();
    this.Windows = new MyWindows();
    this.NoManageWindows = new Set<number>();
    this.Error = new SendingObjectError(this);
    this.Readies = new Set<Promise<boolean>>();
    const promiseWindowsInfo = browser.windows.getAll({ populate: false });
    promiseWindowsInfo.catch((errMessage: string) => {
      this.Ready = Promise.resolve(false);
    });
    this.Ready = promiseWindowsInfo.then(this.SetWindowsInfo);
    this.Readies.add(this.Ready);
    Object.defineProperties(this, {
      Ready: { enumerable: false },
      SendingObjectError: { enumerable: false },
      NoManageWindows: { enumerable: false },
      Readies: { enumerable: false }
    });
  }
}
class SendingObjectError {
  static readonly WaitForErrorHandle = 200;
  static readonly TimerTickTime = 30;
  SendingObject: SendingObject;
  IsError: boolean;
  TimerMilliSeconds: number;

  Timer = async (): Promise<boolean> => {
    while (this.TimerMilliSeconds > 0) {
      if (!this.IsError || app.SendingObject !== this.SendingObject) {
        return false;
      }
      await Thread.Delay(SendingObjectError.TimerTickTime);
      this.TimerMilliSeconds -= SendingObjectError.TimerTickTime;
    }
    this.IsError = false;
    return await this.HandleError();
  }
  HandleError = async (): Promise<boolean> => {
    await app.SendingObject?.Ready;
    app.SendingObject = new SendingObject();
    return true;
  }
  ThrowError(errString: string) {
    app.ErrorLog.push(errString + " : " + new Date().toTimeString());
    if (this.IsError) {
      this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
      return;
    } else {
      this.IsError = true;
      this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
      this.Timer();
    }
  }
  constructor(sendingObject: SendingObject) {
    this.SendingObject = sendingObject;
    this.IsError = false;
    this.TimerMilliSeconds = 0;
  }
}
class App {
  Port: browser.runtime.Port;
  SendingObject: SendingObject;
  SendingJson?: string;
  ErrorLog: string[];
  constructor() {
    this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
    this.SendingObject = new SendingObject;
    this.ErrorLog = new Array<string>();
  }
}