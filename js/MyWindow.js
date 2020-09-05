"use strict";
class MyWindow {
    constructor(arg) {
        this.Verify = async (sizeCheck = false) => {
            if (await this.Ready === false || this.IsNotError === false) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            if (sizeCheck) {
                const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
                if (tabsInfo.length !== this.Tabs.size) {
                    this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
                    this.IsNotError = false;
                }
            }
            return this.IsNotError;
        };
        this.Verify_DontWaitReady = async (sizeCheck = false) => {
            if (this.IsNotError === false) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                this.IsNotError = false;
            }
            if (sizeCheck) {
                const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
                if (tabsInfo.length !== this.Tabs.size) {
                    this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
                    this.IsNotError = false;
                }
            }
            return this.IsNotError;
        };
        this.Verify2 = async () => {
            if (this.Ready2.IsError) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                return false;
            }
            return true;
        };
        this.ActiveTabChanged = async (tabID) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                if (this.ActiveTabID !== undefined) {
                    if (this.Tabs.get(this.ActiveTabID) !== undefined && await this.Tabs.get(this.ActiveTabID).Ready) {
                        this.Tabs.get(this.ActiveTabID).IsActive = false;
                    }
                    else {
                        this.IsNotError = false;
                    }
                }
                if (this.Tabs.get(tabID) !== undefined && await this.Tabs.get(tabID).Ready) {
                    this.Tabs.get(tabID).IsActive = true;
                    const index_RecentTabs = this.RecentTabs.indexOf(tabID);
                    if (index_RecentTabs !== -1) {
                        this.RecentTabs.splice(index_RecentTabs, 1);
                    }
                    this.RecentTabs.unshift(tabID);
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
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.RemoveTab = async (tabID) => {
            if (await this.Ready === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                this.RemoveTabID(tabID);
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.AttachTab = async (tabID) => {
            if (await this.Ready === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                const tabInfo = await browser.tabs.get(tabID).catch(() => {
                    this.IsNotError = false;
                    return undefined;
                });
                if (tabInfo !== undefined) {
                    this.InsertTabInfo(tabInfo);
                }
                for (const tabInfo2 of this.Tabs.values()) {
                    tabInfo2.Update();
                }
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.DetachTab = async (tabID) => {
            if (await this.Ready === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                this.RemoveTabID(tabID);
                for (const tabInfo2 of this.Tabs.values()) {
                    tabInfo2.Update();
                }
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.MoveTab = async () => {
            if (await this.Ready === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                this.TabsInOrder = new Array();
                const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
                for (const tabInfo of tabsInfo) {
                    if (tabInfo.id !== undefined) {
                        this.TabsInOrder[tabInfo.index] = tabInfo.id;
                    }
                    else {
                        throw new Error("Couldn't get the TabID");
                    }
                }
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify(true);
        };
        this.ReplaceTab = async (addedTabID, removedTabID) => {
            if (await this.Ready === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                this.RemoveTabID(removedTabID);
                if (this.Tabs.has(addedTabID)) {
                    await this.Tabs.get(addedTabID).Update();
                }
                else {
                    const tabInfo = await browser.tabs.get(addedTabID).catch(() => {
                        this.IsNotError = false;
                        return undefined;
                    });
                    if (tabInfo !== undefined) {
                        this.InsertTabInfo(tabInfo);
                    }
                }
                return this.IsNotError;
            })();
            await this.Ready;
            return await this.Verify();
        };
        this.UpdateTab = async (tabID) => {
            if (await this.Ready === false) {
                return false;
            }
            if (this.Tabs.has(tabID) === false) {
                this.IsNotError = false;
            }
            else {
                this.Tabs.get(tabID).Update();
            }
            return await this.Verify();
        };
        this.SetWindowInfo = async (windowInfo) => {
            if (windowInfo.type !== "normal") {
                throw new Error("This window type is not normal.");
            }
            this.WindowID = windowInfo.id;
            this.IsActive = windowInfo.focused;
            const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
            for (const tabInfo of tabsInfo) {
                this.SetTabInfo(tabInfo);
            }
            return this.IsNotError;
        };
        this.SetTabInfo = (tabInfo) => {
            if (tabInfo.id !== undefined) {
                this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo));
                this.TabsInOrder[tabInfo.index] = tabInfo.id;
                if (tabInfo.active) {
                    this.ActiveTabID = tabInfo.id;
                    this.RecentTabs.unshift(tabInfo.id);
                }
            }
            else {
                throw new Error("Couldn't get the TabID");
            }
        };
        this.InsertTabInfo = (tabInfo) => {
            if (tabInfo.id !== undefined) {
                this.Tabs.set(tabInfo.id, new MyTab(this, tabInfo));
                this.TabsInOrder.splice(tabInfo.index, 0, tabInfo.id);
            }
            else {
                throw new Error("Couldn't get the TabID");
            }
        };
        this.RemoveTabID = (tabID) => {
            const index_TabsInOrder = this.TabsInOrder.indexOf(tabID);
            const index_RecentTabs = this.RecentTabs.indexOf(tabID);
            if (index_TabsInOrder === -1 || this.Tabs.has(tabID) === false) {
                this.IsNotError = false;
            }
            else {
                this.SendingObject.ReadyInstances.delete(this.Tabs.get(tabID));
                this.Tabs.delete(tabID);
                this.TabsInOrder.splice(index_TabsInOrder, 1);
                if (index_RecentTabs !== -1) {
                    this.RecentTabs.splice(index_RecentTabs, 1);
                }
                if (this.ActiveTabID === tabID) {
                    this.ActiveTabID = undefined;
                }
            }
        };
        this.Ready2 = new Ready();
        this.IsNotError = true;
        this.IsActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
        this.Tabs = new MyTabs();
        this.Tabs2 = new MyTabs();
        this.SendingObject = app.SendingObject;
        this.IsReady = false;
        this.Ready = (async () => {
            let windowInfo;
            if (typeof arg === "number") {
                const windowID = arg;
                windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
                    this.IsNotError = false;
                    return undefined;
                });
            }
            else {
                windowInfo = arg;
            }
            if (windowInfo !== undefined) {
                await this.SetWindowInfo(windowInfo);
            }
            this.IsNotError = await this.Verify_DontWaitReady(true);
            this.IsReady = true;
            return this.IsNotError;
        })();
        this.SendingObject.ReadyInstances.add(this);
        Object.defineProperties(this, {
            Ready: { enumerable: false },
            Ready2: { enumerable: false },
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