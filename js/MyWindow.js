"use strict";
class MyWindow {
    constructor(arg) {
        this.Verify = async () => {
            if (await this.Ready === false || this.IsNotError === false) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            if (tabsInfo.length !== this.Tabs.size) {
                this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.Verify_DontWaitReady = async () => {
            if (this.IsNotError === false) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            if (tabsInfo.length !== this.Tabs.size) {
                this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.ActiveTabChanged = async (tabID) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                if (this.ActiveTabID !== undefined && this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID).Ready) {
                    this.Tabs.get(this.ActiveTabID).IsActive = false;
                }
                else {
                    this.IsNotError = false;
                }
                if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID).Ready) {
                    this.Tabs.get(tabID).IsActive = true;
                }
                else {
                    this.IsNotError = false;
                }
                this.ActiveTabID = tabID;
                this.IsReady = true;
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.CreateTab = async (tabInfo) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                this.InsertTabInfo(tabInfo);
                for (const tabInfo of this.Tabs.values()) {
                    tabInfo.Update();
                }
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.SetWindowInfo = async (windowInfo) => {
            if (windowInfo.type !== "normal") {
                throw new Error("This window type is not normal.");
            }
            this.WindowID = windowInfo.id;
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            for (const tabInfo of tabsInfo) {
                this.SetTabInfo(tabInfo);
            }
            this.IsReady = true;
            return this.IsReady;
        };
        this.SetTabInfo = (tabInfo) => {
            if (tabInfo.id !== undefined) {
                this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
                this.TabsInOrder[tabInfo.index] = tabInfo.id;
            }
            else {
                throw new Error("Couldn't get the TabID");
            }
        };
        this.InsertTabInfo = (tabInfo) => {
            if (tabInfo.id !== undefined) {
                this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo.id));
                this.TabsInOrder.splice(tabInfo.index, 0, tabInfo.id);
            }
            else {
                throw new Error("Couldn't get the TabID");
            }
        };
        this.IsNotError = true;
        this.IsActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
        this.Tabs = new MyTabs();
        this.Tabs2 = new MyTabs();
        this.SendingObject = app.SendingObject;
        this.IsReady = false;
        this.Ready = (async () => {
            if (typeof arg === "number") {
                const windowID = arg;
                const windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
                    this.IsNotError = false;
                    return undefined;
                });
                if (windowInfo !== undefined) {
                    await this.SetWindowInfo(windowInfo);
                }
            }
            else {
                const windowInfo = arg;
                await this.SetWindowInfo(windowInfo);
            }
            this.IsNotError = await this.Verify_DontWaitReady();
            this.IsReady = true;
            return this.IsNotError;
        })();
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