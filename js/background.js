"use strict";
let port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
if (port === undefined) {
    console.log("connectNative() returned undefined object.");
}
const updateJson = (responce) => {
};
port.onMessage.addListener((response) => {
    console.log("Received: " + response);
});
browser.browserAction.onClicked.addListener(() => {
    console.log("Sending: ping");
    port.postMessage("ping");
});
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
class MyWindow {
    constructor(WindowID) {
        this.OnActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
    }
}
class App {
}
const app = new App();
//# sourceMappingURL=background.js.map