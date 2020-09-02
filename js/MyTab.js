"use strict";
class MyTab {
    constructor(myWindow, arg) {
        this.SetTabInfo = async (tabInfo) => {
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
        };
        this.IsReady = false;
        this.SendingObject = app.SendingObject;
        this.MyWindow = myWindow;
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
        this.SendingObject.ReadyInstances.add(this);
        Object.defineProperties(this, {
            Ready: { enumerable: false },
            SendingObject: { enumerable: false },
            MyWindow: { enumerable: false }
        });
    }
}
class MyTabs extends Map {
    toJSON() {
        return [...this];
    }
}
//# sourceMappingURL=MyTab.js.map