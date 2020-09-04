"use strict";
class SendingObject {
    constructor() {
        this.AllReadyResolved = async () => {
            for (const inst of this.ReadyInstances) {
                const isNotError = await inst.Ready;
                if (isNotError === false) {
                    return false;
                }
            }
            return true;
        };
        this.FindWindowWhichHasTheTabID = async (tabID) => {
            const isNotError = await this.AllReadyResolved();
            if (isNotError === false) {
                return undefined;
            }
            if (this.ActiveWindowID !== undefined) {
                if (this.Windows.has(this.ActiveWindowID)) {
                    if (this.Windows.get(this.ActiveWindowID).Tabs.has(tabID)) {
                        return this.Windows.get(this.ActiveWindowID);
                    }
                }
                else {
                    this.IsNotError = false;
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
            const isNotError = await this.Ready;
            if (isNotError === false) {
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
            for (const windowInfo of windowsInfo) {
                if (windowInfo.id === undefined) {
                    this.IsNotError = false;
                    break;
                }
                if (windowInfo.type !== "normal") {
                    this.UnmanagedWindows.add(windowInfo.id);
                }
                else {
                    if (windowInfo.id !== undefined) {
                        this.Windows.set(windowInfo.id, new MyWindow(windowInfo));
                        if (windowInfo.focused) {
                            this.ActiveWindowID = windowInfo.id;
                        }
                    }
                }
            }
            this.IsReady = true;
            return this.IsNotError;
        };
        this.Verify = async () => {
            if (await this.Ready === false || this.IsNotError === false) {
                this.Error.ThrowError("Sending Object");
                this.IsNotError = false;
            }
            const windowsInfo = await browser.windows.getAll({ populate: false });
            if (windowsInfo.length !== this.Windows.size + this.UnmanagedWindows.size) {
                this.Error.ThrowError("Sending Object : The number of windows won't match.");
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.Verify_DontWaitReady = async () => {
            if (this.IsNotError === false) {
                this.Error.ThrowError("Sending Object");
                this.IsNotError = false;
            }
            const windowsInfo = await browser.windows.getAll({ populate: false });
            if (windowsInfo.length !== this.Windows.size + this.UnmanagedWindows.size) {
                this.Error.ThrowError("Sending Object : The number of windows won't match.");
                this.IsNotError = false;
            }
            return this.IsNotError;
        };
        this.AddWindow = async (windowInfo) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = this.SetWindowsInfo([windowInfo]);
            return await this.Ready && this.Verify();
        };
        this.RemoveWindow = async (windowID) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.UnmanagedWindows.delete(windowID);
            if (this.Windows.has(windowID)) {
                if (this.ActiveWindowID === windowID) {
                    this.ActiveWindowID = undefined;
                }
                this.ReadyInstances.delete(this.Windows.get(windowID));
                this.Windows.delete(windowID);
            }
            this.IsNotError = await this.Verify();
            return this.IsNotError;
        };
        this.FocusChanged = async (windowID) => {
            const isNotError = await this.Ready;
            if (isNotError === false) {
                return false;
            }
            this.IsReady = false;
            this.Ready = (async () => {
                if (this.ActiveWindowID !== undefined) {
                    if (this.Windows.has(this.ActiveWindowID) && await this.Windows.get(this.ActiveWindowID).Ready) {
                        this.Windows.get(this.ActiveWindowID).IsActive = false;
                    }
                    else {
                        this.IsNotError = false;
                    }
                }
                if (windowID === -1 || this.UnmanagedWindows.has(windowID)) {
                    this.ActiveWindowID = undefined;
                }
                else {
                    if (this.Windows.has(windowID) && await this.Windows.get(windowID).Ready) {
                        this.Windows.get(windowID).IsActive = true;
                        this.ActiveWindowID = windowID;
                    }
                    else {
                        this.IsNotError = false;
                    }
                }
                this.IsReady = true;
                return this.IsNotError;
            })();
            return await this.Ready;
        };
        this.IsNotError = true;
        this.ActiveWindowID = undefined;
        this.Arrangements = new Arrangements();
        this.Windows = new MyWindows();
        this.UnmanagedWindows = new Set();
        this.Error = new SendingObjectError(this);
        this.ReadyInstances = new Set();
        this.IsReady = false;
        this.Ready = (async () => {
            const WindowsInfo = await browser.windows.getAll({ populate: false }).catch(() => {
                return undefined;
            });
            if (WindowsInfo !== undefined) {
                await this.SetWindowsInfo(WindowsInfo);
                this.IsNotError = await this.Verify_DontWaitReady();
            }
            else {
                this.IsNotError = false;
            }
            this.IsReady = true;
            return this.IsNotError;
        })();
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