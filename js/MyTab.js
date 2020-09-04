"use strict";
class MyTab {
    constructor(myWindow, arg) {
        this.Verify = async () => {
            if (await this.Ready === false || this.IsNotError === false) {
                this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.Verify_DontWaitReady = async () => {
            if (this.IsNotError === false) {
                this.SendingObject.Error.ThrowError(`MyTab : WindowID = ${this.WindowID} : TabID = ${this.TabID}`);
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.Query = async () => {
            const tabInfo = await browser.tabs.get(this.TabID).catch(() => {
                this.IsNotError = false;
                return undefined;
            });
            return tabInfo;
        };
        this.Update = async () => {
            const isReady = await this.Ready;
            if (isReady === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                const tabInfo = await this.Query();
                if (tabInfo !== undefined) {
                    this.IsNotError = await this.SetTabInfo(tabInfo);
                }
                this.IsReady = true;
                return this.IsNotError;
            })();
            await this.Ready;
            return this.IsNotError;
        };
        this.SetTabInfo = async (tabInfo) => {
            this.IsActive = tabInfo.active;
            this.WindowID = tabInfo.windowId;
            this.TabID = tabInfo.id;
            // this.Index = tabInfo.index;
            this.Status = tabInfo.status;
            this.Title = tabInfo.title;
            this.URL = tabInfo.url;
            this.IsPinned = tabInfo.pinned;
            this.IsHidden = tabInfo.hidden;
            return true;
        };
        this.IsNotError = true;
        this.SendingObject = app.SendingObject;
        this.MyWindow = myWindow;
        this.IsReady = false;
        this.Ready = (async () => {
            let tabInfo;
            if (typeof arg === "number") {
                this.TabID = arg;
                tabInfo = await this.Query();
            }
            else {
                tabInfo = arg;
            }
            if (tabInfo !== undefined) {
                this.IsNotError = await this.SetTabInfo(tabInfo);
            }
            else {
                this.IsNotError = false;
            }
            this.IsReady = true;
            return await this.Verify_DontWaitReady();
        })();
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