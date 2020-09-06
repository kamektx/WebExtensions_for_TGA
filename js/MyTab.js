"use strict";
class MyTab {
    constructor(myWindow, arg) {
        this.Verify = async () => {
            if (this.Ready2.IsNotError === false) {
                this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
                return false;
            }
            return true;
        };
        this.Query = async () => {
            const tabInfo = await browser.tabs.get(this.TabID).catch(() => {
                return undefined;
            });
            return tabInfo;
        };
        this.Update = async () => {
            return this.Ready2.AddWriteTask(async () => {
                const tabInfo = await this.Query();
                let result;
                if (tabInfo !== undefined) {
                    return this.SetTabInfo(tabInfo);
                }
                else {
                    return false;
                }
            });
        };
        this.SetTabInfo = (tabInfo) => {
            this.IsActive = tabInfo.active;
            this.WindowID = tabInfo.windowId;
            this.TabID = tabInfo.id;
            this.Status = tabInfo.status;
            this.Title = tabInfo.title;
            this.URL = tabInfo.url;
            this.IsPinned = tabInfo.pinned;
            this.IsHidden = tabInfo.hidden;
            return true;
        };
        this.Ready2 = new Ready();
        this.Ready2.AddVerifyTask(this.Verify);
        this.SendingObject = app.SendingObject;
        this.MyWindow = myWindow;
        this.Ready2.AddWriteTask(async () => {
            let tabInfo;
            if (typeof arg === "number") {
                this.TabID = arg;
                tabInfo = await this.Query();
            }
            else {
                tabInfo = arg;
            }
            if (tabInfo !== undefined) {
                return this.SetTabInfo(tabInfo);
            }
            else {
                return false;
            }
        });
        Object.defineProperties(this, {
            Ready2: { enumerable: false },
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