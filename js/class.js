"use strict";
const DirectionArray = [
    "Down",
    "Up",
    "Right",
    "Left"
];
class RowSetting {
    constructor(myType = "", maxColumns = 0) {
        this.Type = myType;
        this.MaxColumns = maxColumns;
    }
}
class ColumnSetting {
    constructor(row = new RowSetting(), size = "big") {
        this.Size = size;
        this.Row = row;
    }
}
class StartPosition {
    constructor(row = 0, column = 0) {
        this.Column = column;
        this.Row = row;
    }
}
class Arrangement {
    constructor(startPosition = new StartPosition()) {
        this.Column = new Array();
        this.StartPosition = startPosition;
    }
}
class HandleDirection {
    constructor() {
        this.Down = false;
        this.Up = false;
        this.Right = false;
        this.Left = false;
    }
}
class Arrangements {
    constructor() {
        this.HandleDirection = new HandleDirection();
    }
    AddDirection(arrangement, direction, overWrite = false) {
        if (this.HandleDirection[direction] && !overWrite) {
            return false;
        }
        this.HandleDirection[direction] = true;
        this[direction] = arrangement;
        return true;
    }
    RemoveDirecton(direction) {
        if (!this.HandleDirection[direction]) {
            return false;
        }
        this.HandleDirection[direction] = false;
        this[direction] = undefined;
        return true;
    }
}
class ScreenShot {
    toJSON() {
        return this.ID + "." + this.Format;
    }
}
class MyTab {
    constructor(arg) {
        this.SetTabInfo = async (tabInfo) => {
            this.IsActive = tabInfo.active;
            this.WindowID = tabInfo.windowId;
            this.TabID = tabInfo.id;
            this.Index = tabInfo.index;
            this.Title = tabInfo.title;
            this.URL = tabInfo.url;
            this.IsReady = true;
            return true;
        };
        this.IsReady = false;
        if (typeof arg === "number") {
            const tabID = arg;
            const promiseTabInfo = browser.tabs.get(tabID);
            promiseTabInfo.catch((errMessage) => {
                this.Ready = Promise.resolve(false);
            });
            this.Ready = promiseTabInfo.then(this.SetTabInfo);
        }
        else {
            const tabInfo = arg;
            this.Ready = this.SetTabInfo(tabInfo);
        }
        Object.defineProperties(this, {
            Ready: { enumerable: false }
        });
    }
}
class MyTabs extends Map {
    toJSON() {
        return [...this];
    }
}
class MyWindow {
    constructor(arg) {
        this.SetWindowInfo = async (windowInfo) => {
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
        };
        this.IsReady = false;
        this.IsActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
        this.Tabs = new MyTabs();
        this.Tabs2 = new MyTabs();
        if (typeof arg === "number") {
            const windowID = arg;
            const promiseWindowInfo = browser.windows.get(windowID, { populate: false });
            promiseWindowInfo.catch((errMessage) => {
                this.Ready = Promise.resolve(false);
            });
            this.Ready = promiseWindowInfo.then(this.SetWindowInfo);
        }
        else {
            const windowInfo = arg;
            this.Ready = this.SetWindowInfo(windowInfo);
        }
        Object.defineProperties(this, {
            Ready: { enumerable: false },
            Tabs2: { enumerable: false }
        });
    }
}
class MyWindows extends Map {
    toJSON() {
        return [...this];
    }
}
class SendingObject {
    constructor() {
        this.SetWindowsInfo = async (windowsInfo) => {
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
        };
        this.AddWindow = async (windowInfo) => {
            const isReady = await this.Ready;
            this.IsReady = false;
            if (isReady === false) {
                return false;
            }
            this.Ready = this.SetWindowsInfo([windowInfo]);
            return await this.Ready;
        };
        this.RemoveWindow = async (windowID) => {
            const isReady = await this.Ready;
            if (isReady === false) {
                return false;
            }
            this.Windows.delete(windowID);
            this.IsReady = true;
        };
        this.FocusChanged = async (windowID) => {
            const isReady = await this.Ready;
            this.IsReady = false;
            if (isReady === false) {
                return false;
            }
            this.Ready = (async () => {
                if (this.ActiveWindowID !== undefined && this.Windows.get(this.ActiveWindowID) !== undefined) {
                    if (await this.Windows.get(this.ActiveWindowID).Ready) {
                        this.Windows.get(this.ActiveWindowID).IsActive = false;
                    }
                }
                else {
                    return false;
                }
                if (this.Windows.get(windowID) !== undefined) {
                    if (await this.Windows.get(windowID).Ready) {
                        this.Windows.get(windowID).IsActive = true;
                    }
                }
                else {
                    return false;
                }
                this.ActiveWindowID = windowID;
                this.IsReady = true;
                return true;
            })();
            return await this.Ready;
        };
        this.IsReady = false;
        this.ActiveWindowID = -1;
        this.Arrangements = new Arrangements();
        this.Windows = new MyWindows();
        const promiseWindowsInfo = browser.windows.getAll({ populate: false });
        promiseWindowsInfo.catch((errMessage) => {
            this.Ready = Promise.resolve(false);
        });
        this.Ready = promiseWindowsInfo.then(this.SetWindowsInfo);
        Object.defineProperties(this, {
            Ready: { enumerable: false }
        });
    }
}
class App {
    constructor() {
        this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
    }
}
//# sourceMappingURL=class.js.map