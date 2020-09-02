"use strict";
class MyWindow {
    constructor(arg) {
        this.Verify = async () => {
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
        };
        this.ActiveTabChanged = async (tabID) => {
            const isReady = await this.Ready;
            this.IsReady = false;
            if (isReady === false) {
                return false;
            }
            this.Ready = (async () => {
                if (this.ActiveTabID !== undefined && this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID).Ready) {
                    this.Tabs.get(this.ActiveTabID).IsActive = false;
                }
                else {
                    return false;
                }
                if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID).Ready) {
                    this.Tabs.get(tabID).IsActive = true;
                }
                else {
                    return false;
                }
                this.ActiveTabID = tabID;
                this.IsReady = true;
                return true;
            })();
            return await this.Ready && await this.Verify();
        };
        this.SetWindowInfo = async (windowInfo) => {
            if (windowInfo.type !== "normal") {
                throw new Error("This window type is not normal.");
            }
            this.WindowID = windowInfo.id;
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            for (const tabInfo of tabsInfo) {
                if (tabInfo.id !== undefined) {
                    this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
                    this.TabsInOrder[tabInfo.index] = tabInfo.id;
                }
                else {
                    throw new Error("Couldn't get the TabID");
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
        this.SendingObject = app.SendingObject;
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
        this.SendingObject.ReadyInstances.add(this);
        Object.defineProperties(this, {
            Ready: { enumerable: false },
            Tabs2: { enumerable: false },
            SendingObject: { enumerable: false }
        });
    }
}
class MyWindows extends Map {
    toJSON() {
        return [...this];
    }
}
//# sourceMappingURL=MyWindow.js.map