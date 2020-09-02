"use strict";
class SendingObject {
    constructor() {
        this.AllReadyResolved = async () => {
            for (const inst of this.ReadyInstances) {
                const isReady = await inst.Ready;
                if (isReady === false) {
                    return false;
                }
            }
            return true;
        };
        this.FindWindowWhichHasTheTabID = async (tabID) => {
            const isReady = await this.AllReadyResolved();
            if (isReady === false) {
                return undefined;
            }
            if (this.ActiveWindowID !== undefined) {
                if (this.Windows.has(this.ActiveWindowID)) {
                    if (this.Windows.get(this.ActiveWindowID).Tabs.has(tabID)) {
                        return this.Windows.get(this.ActiveWindowID);
                    }
                }
                else {
                    this.IsReady = false;
                    this.Error.ThrowError("Sending Object : this.Windows.has(this.ActiveWindowID) returned false.");
                    return undefined;
                }
            }
            for (const myWindow of this.Windows.values()) {
                if (myWindow.Tabs.has(tabID)) {
                    return myWindow;
                }
            }
            return undefined;
        };
        this.HasWindowID = async (windowID) => {
            const isReady = await this.Ready;
            if (isReady === false) {
                return "false";
            }
            if (this.Windows.has(windowID)) {
                return "managed";
            }
            else if (this.UnmanagedWindows.has(windowID)) {
                return "unmanaged";
            }
            else {
                return "false";
            }
        };
        this.SetWindowsInfo = async (windowsInfo) => {
            if (windowsInfo.length === 0) {
                return false;
            }
            for (const windowInfo of windowsInfo) {
                if (windowInfo.id === undefined) {
                    this.IsReady = false;
                    return false;
                }
                if (windowInfo.type !== "normal") {
                    this.UnmanagedWindows.add(windowInfo.id);
                }
                else {
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
            }
            this.IsReady = await this.Verify();
            return this.IsReady;
        };
        this.Verify = async () => {
            if (await this.Ready === false) {
                this.Error.ThrowError("Sending Object");
                this.IsReady = false;
                return false;
            }
            const windowsInfo = await browser.windows.getAll({ populate: false });
            if (windowsInfo.length !== this.Windows.size + this.UnmanagedWindows.size) {
                this.Error.ThrowError("Sending Object : The number of windows won't match.");
                this.IsReady = false;
                return false;
            }
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
            this.UnmanagedWindows.delete(windowID);
            if (this.Windows.has(windowID)) {
                this.ReadyInstances.delete(this.Windows.get(windowID));
                this.Windows.delete(windowID);
            }
            this.IsReady = await this.Verify();
            return this.IsReady;
        };
        this.FocusChanged = async (windowID) => {
            const isReady = await this.Ready;
            this.IsReady = false;
            if (isReady === false) {
                return false;
            }
            this.Ready = (async () => {
                if (this.ActiveWindowID !== undefined) {
                    if (this.Windows.get(this.ActiveWindowID) !== undefined && await this.Windows.get(this.ActiveWindowID).Ready) {
                        this.Windows.get(this.ActiveWindowID).IsActive = false;
                    }
                    else {
                        return false;
                    }
                }
                if (this.UnmanagedWindows.has(windowID)) {
                    this.ActiveWindowID = undefined;
                }
                else {
                    if (this.Windows.get(windowID) !== undefined && await this.Windows.get(windowID).Ready) {
                        this.Windows.get(windowID).IsActive = true;
                        this.ActiveWindowID = windowID;
                    }
                    else {
                        return false;
                    }
                }
                this.IsReady = await this.Verify();
                return this.IsReady;
            })();
            return await this.Ready;
        };
        this.IsReady = false;
        this.ActiveWindowID = -1;
        this.Arrangements = new Arrangements();
        this.Windows = new MyWindows();
        this.UnmanagedWindows = new Set();
        this.Error = new SendingObjectError(this);
        this.ReadyInstances = new Set();
        const promiseWindowsInfo = browser.windows.getAll({ populate: false });
        promiseWindowsInfo.catch((errMessage) => {
            this.Ready = Promise.resolve(false);
        });
        this.Ready = promiseWindowsInfo.then(this.SetWindowsInfo);
        this.ReadyInstances.add(this);
        Object.defineProperties(this, {
            Ready: { enumerable: false },
            Error: { enumerable: false },
            UnmanagedWindows: { enumerable: false },
            ReadyInstances: { enumerable: false }
        });
    }
}
//# sourceMappingURL=SendingObject.js.map