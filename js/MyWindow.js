"use strict";
class MyWindow {
    constructor(arg) {
        // Verify = async (sizeCheck: boolean = false): Promise<boolean> => {
        //   if (await this.Ready === false || this.IsNotError === false) {
        //     this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
        //     this.IsNotError = false;
        //   }
        //   if (sizeCheck) {
        //     const tabsInfo = await browser.tabs.query({ windowId: this.WindowID });
        //     if (tabsInfo.length !== this.Tabs.size) {
        //       this.SendingObject.Error.ThrowError("MyWindow : The number of tabs won't match. : WindowID = " + this.WindowID);
        //       this.IsNotError = false;
        //     }
        //   }
        //   return this.IsNotError;
        // }
        this.Verify2 = async () => {
            if (this.Ready2.IsError) {
                this.SendingObject.Error.ThrowError("MyWindow : WindowID = " + this.WindowID);
                return false;
            }
            return true;
        };
        this.ActiveTabChanged = async (tabID) => {
            return await this.Ready2.AddWriteTask(async () => {
                if (this.ActiveTabID !== undefined) {
                    if (this.Tabs.has(this.ActiveTabID)) {
                        const myTab = this.Tabs.get(this.ActiveTabID);
                        await myTab.Ready2.AddWriteTask(async () => {
                            myTab.IsActive = false;
                            return true;
                        });
                    }
                    else {
                        return false;
                    }
                }
                if (this.Tabs.has(tabID)) {
                    const myTab = this.Tabs.get(tabID);
                    await myTab.Ready2.AddWriteTask(async () => {
                        myTab.IsActive = true;
                        return true;
                    });
                    const index_RecentTabs = this.RecentTabs.indexOf(tabID);
                    if (index_RecentTabs !== -1) {
                        this.RecentTabs.splice(index_RecentTabs, 1);
                    }
                    this.RecentTabs.unshift(tabID);
                }
                else {
                    return false;
                }
                this.ActiveTabID = tabID;
                return true;
            });
        };
        this.CreateTab = async (tabInfo) => {
            return await this.Ready2.AddWriteTask(async () => {
                this.InsertTabInfo(tabInfo);
                return true;
            });
        };
        this.RemoveTab = async (tabID) => {
            return await this.Ready2.AddWriteTask(async () => {
                return this.RemoveTabID(tabID);
            });
        };
        this.AttachTab = async (tabID) => {
            return await this.Ready2.AddWriteTask(async () => {
                const tabInfo = await browser.tabs.get(tabID).catch(() => {
                    return undefined;
                });
                if (tabInfo !== undefined) {
                    this.InsertTabInfo(tabInfo);
                }
                else {
                    return false;
                }
                return true;
            });
        };
        this.DetachTab = async (tabID) => {
            return await this.Ready2.AddWriteTask(async () => {
                return this.RemoveTabID(tabID);
            });
        };
        this.MoveTab = async () => {
            return await this.Ready2.AddWriteTask(async () => {
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
                return true;
            });
        };
        this.ReplaceTab = async (addedTabID, removedTabID) => {
            return await this.Ready2.AddWriteTask(async () => {
                const result1 = this.RemoveTabID(removedTabID);
                if (this.Tabs.has(addedTabID)) {
                    await this.Tabs.get(addedTabID).Update();
                }
                else {
                    const tabInfo = await browser.tabs.get(addedTabID).catch(() => {
                        return undefined;
                    });
                    if (tabInfo !== undefined) {
                        this.InsertTabInfo(tabInfo);
                    }
                    else {
                        return false;
                    }
                }
                return result1;
            });
        };
        this.UpdateTab = async (tabID) => {
            return await this.Ready2.AddReadTask(async () => {
                if (this.Tabs.has(tabID) === false) {
                    return false;
                }
                else {
                    return await this.Tabs.get(tabID).Update();
                }
            });
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
            return true;
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
                return false;
            }
            else {
                this.Tabs.delete(tabID);
                this.TabsInOrder.splice(index_TabsInOrder, 1);
                if (index_RecentTabs !== -1) {
                    this.RecentTabs.splice(index_RecentTabs, 1);
                }
                if (this.ActiveTabID === tabID) {
                    this.ActiveTabID = undefined;
                }
            }
            return true;
        };
        this.Ready2 = new Ready();
        this.IsActive = false;
        this.RecentTabs = new Array();
        this.TabsInOrder = new Array();
        this.Tabs = new MyTabs();
        this.Tabs2 = new MyTabs();
        this.SendingObject = app.SendingObject;
        this.Ready2.AddVerifyTask(this.Verify2);
        this.Ready2.AddWriteTask(async () => {
            let result;
            let windowInfo;
            if (typeof arg === "number") {
                const windowID = arg;
                windowInfo = await browser.windows.get(windowID, { populate: false }).catch(() => {
                    return undefined;
                });
            }
            else {
                windowInfo = arg;
            }
            if (windowInfo !== undefined) {
                result = await this.SetWindowInfo(windowInfo);
            }
            else {
                return false;
            }
            return result;
        }, "error");
        Object.defineProperties(this, {
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