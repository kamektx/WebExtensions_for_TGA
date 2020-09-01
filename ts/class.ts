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
  IsPinned?: boolean;

  SetTabInfo = async (tabInfo: browser.tabs.Tab): Promise<boolean> => {
    this.IsActive = tabInfo.active;
    this.WindowID = tabInfo.windowId;
    this.TabID = tabInfo.id;
    this.Index = tabInfo.index;
    this.Title = tabInfo.title;
    this.URL = tabInfo.url;
    this.IsReady = true;
    return true;
  }
  constructor(arg: (number | browser.tabs.Tab)) {
    this.IsReady = false;
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
    Object.defineProperties(this, {
      Ready: { enumerable: false }
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
  Tabs: MyTabs;
  Tabs2: MyTabs;

  SetWindowInfo = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    if (windowInfo.type !== "normal") {
      throw new Error("This window type is not normal.");
    }
    this.WindowID = windowInfo.id;
    const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
    for (const tabInfo of tabsInfo) {
      if (tabInfo.id !== undefined) {
        this.Tabs.set(tabInfo.id, new MyTab(tabInfo.id));
        this.TabsInOrder[tabInfo.index] = tabInfo.id;
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
    Object.defineProperties(this, {
      Ready: { enumerable: false },
      Tabs2: { enumerable: false }
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
  ActiveWindowID: number;
  Arrangements: Arrangements;
  Windows: MyWindows;
  SetWindowsInfo = async (windowsInfo: browser.windows.Window[]): Promise<boolean> => {
    if (windowsInfo.length === 0) {
      return false;
    }
    for (const windowInfo of windowsInfo) {
      if (windowInfo.type !== "normal") {
        continue;
      }
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
    this.IsReady = true;
    return true;
  }
  AddWindow = async (windowInfo: browser.windows.Window): Promise<boolean> => {
    const isReady = await this.Ready;
    this.IsReady = false;
    if (isReady === false) {
      return false;
    }
    this.Ready = this.SetWindowsInfo([windowInfo]);
    return await this.Ready;
  }
  RemoveWindow = async (windowID: number): Promise<boolean> => {
    const isReady = await this.Ready;
    if (isReady === false) {
      return false;
    }
    this.Windows.delete(windowID);
    this.IsReady = true;
  }
  FocusChanged = async (windowID: number): Promise<boolean> => {
    const isReady = await this.Ready;
    this.IsReady = false;
    if (isReady === false) {
      return false;
    }
    this.Ready = (async () => {
      if (this.ActiveWindowID !== undefined && this.Windows.get(this.ActiveWindowID) !== undefined) {
        if (await this.Windows.get(this.ActiveWindowID)!.Ready) {
          this.Windows.get(this.ActiveWindowID)!.IsActive = false;
        }
      } else {
        return false;
      }
      if (this.Windows.get(windowID) !== undefined) {
        if (await this.Windows.get(windowID)!.Ready) {
          this.Windows.get(windowID)!.IsActive = true;
        }
      } else {
        return false;
      }
      this.ActiveWindowID = windowID;
      this.IsReady = true;
      return true;
    })();
    return await this.Ready;
  }
  constructor() {
    this.IsReady = false;
    this.ActiveWindowID = -1;
    this.Arrangements = new Arrangements();
    this.Windows = new MyWindows();
    const promiseWindowsInfo = browser.windows.getAll({ populate: false });
    promiseWindowsInfo.catch((errMessage: string) => {
      this.Ready = Promise.resolve(false);
    });
    this.Ready = promiseWindowsInfo.then(this.SetWindowsInfo);
    Object.defineProperties(this, {
      Ready: { enumerable: false }
    });
  }
}
class App {
  Port: browser.runtime.Port;
  SendingObject?: SendingObject;
  SendingJson?: string;
  constructor() {
    this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
  }
}