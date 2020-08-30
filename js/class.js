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
class MyTab {
    constructor(tabID) {
    }
}
class MyTabs extends Map {
    toJSON() {
        return JSON.stringify([...this]);
    }
}
class MyWindow {
    constructor(windowID) {
        this.IsActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
        this.IsReady = false;
        Object.defineProperties(this, {
            ready: { enumerable: false },
            Tabs2: { enumerable: false }
        });
        const promiseWindowInfo = browser.windows.get(windowID, { populate: false });
        promiseWindowInfo.catch((errMessage) => {
            throw new Error(errMessage);
        });
        this.Ready = promiseWindowInfo.then(async (windowInfo) => {
            if (windowInfo.type !== "normal") {
                throw new Error("This window type is not normal.");
            }
            this.WindowID = windowID;
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            this.Tabs = new MyTabs();
            for (const tabInfo of tabsInfo) {
                if (tabInfo.id !== undefined) {
                    this.Tabs.set(tabInfo.id, new MyTab(tabInfo.id));
                }
            }
            this.IsReady = true;
        });
    }
}
class MyWindows extends Map {
    toJSON() {
        return JSON.stringify([...this]);
    }
}
class SendingObject {
}
class App {
    constructor() {
        this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
    }
}
const app = new App();
//# sourceMappingURL=class.js.map