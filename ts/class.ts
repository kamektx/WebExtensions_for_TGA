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
class MyTab{
  constructor(tabID: number){

  }
}
class MyTabs extends Map<number, MyTab>{
  toJSON(){
    return JSON.stringify([...this]);
  }
}
class MyWindow {
  Ready: Promise<void>;
  IsReady: boolean;
  IsActive: boolean = false;
  WindowID?: number;
  ActiveTabID?: number;
  RecentTabs: number[] = new Array<number>();
  TabsInOrder: number[] = new Array<number>();
  Tabs?: MyTabs;
  Tabs2?: MyTabs;
  constructor(windowID: number) {
    this.IsReady = false;
    Object.defineProperties(this, {
      ready: {enumerable: false},
      Tabs2: {enumerable: false}
    });
    const promiseWindowInfo = browser.windows.get(windowID, { populate: false });
    promiseWindowInfo.catch((errMessage: string) => {
      throw new Error(errMessage);
    });
    this.Ready = promiseWindowInfo.then(async (windowInfo: browser.windows.Window) => {
      if (windowInfo.type !== "normal") {
        throw new Error("This window type is not normal.");
      }
      this.WindowID = windowID;
      const tabsInfo = await browser.tabs.query({windowId: this.WindowID});
      this.Tabs = new MyTabs();
      for (const tabInfo of tabsInfo) {
        if(tabInfo.id !== undefined){
          this.Tabs.set(tabInfo.id, new MyTab(tabInfo.id));
        }
      }
      this.IsReady = true;
    });
  }
}
class MyWindows extends Map<number, MyWindow>{
  toJSON(){
    return JSON.stringify([...this]);
  }
}
class SendingObject{
  ActiveWindowID?: number;
  Arrangements?: Arrangements;
  Windows?: MyWindows;
}
class App {
  Port: browser.runtime.Port;
  SendingObject?: SendingObject;
  SendingJson?: string;
  constructor(){
    this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
  }
}
const app = new App()