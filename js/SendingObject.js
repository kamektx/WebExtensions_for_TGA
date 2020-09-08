"use strict";
class SendingObject {
    constructor() {
        this.Type = "SendingObject";
        this.FindWindowWhichHasTheTabID = async (tabID) => {
            const result = await this.Ready2.AddReadTaskAny(async () => {
                const activeWindowID = this.ActiveWindowID;
                if (activeWindowID !== undefined) {
                    if (this.Windows.has(activeWindowID)) {
                        const myWindow = this.Windows.get(activeWindowID);
                        if (await myWindow.Ready2.AddReadTask(async () => myWindow.Tabs.has(tabID), "ignore")) {
                            return myWindow;
                        }
                    }
                    else {
                        this.Ready2.AddWriteTask(async () => false);
                        return undefined;
                    }
                }
                for (const myWindow of this.Windows.values()) {
                    if (await myWindow.Ready2.AddReadTask(async () => myWindow.Tabs.has(tabID), "ignore")) {
                        return myWindow;
                    }
                }
                return undefined;
            });
            return result;
        };
        this.HasWindowID = async (windowID) => {
            var _a;
            return (_a = await this.Ready2.AddReadTaskAny(async () => {
                if (this.Windows.has(windowID)) {
                    return "managed";
                }
                else if (this.UnmanagedWindows.has(windowID)) {
                    return "unmanaged";
                }
                else {
                    return "false";
                }
            })) !== null && _a !== void 0 ? _a : "false";
        };
        this.SetWindowsInfo = async (windowsInfo) => {
            for (const windowInfo of windowsInfo) {
                if (windowInfo.id === undefined) {
                    throw new Error();
                }
                if (windowInfo.type !== "normal") {
                    this.UnmanagedWindows.add(windowInfo.id);
                }
                else {
                    this.Windows.set(windowInfo.id, new MyWindow(windowInfo));
                    if (windowInfo.focused) {
                        this.ActiveWindowID = windowInfo.id;
                    }
                }
            }
            return true;
        };
        this.Verify = async () => {
            if (this.Ready2.IsNotError === false) {
                this.Error.ThrowError("Sending Object");
                return false;
            }
            // const windowsInfo = await browser.windows.getAll({ populate: false });
            // if (windowsInfo.length !== this.Windows.size + this.UnmanagedWindows.size) {
            //   this.Error.ThrowError("Sending Object : The number of windows won't match.");
            //   return false;
            // }
            return true;
        };
        this.AddWindow = async (windowInfo) => {
            return await this.Ready2.AddWriteTask(async () => {
                return this.SetWindowsInfo([windowInfo]);
            });
        };
        this.RemoveWindow = async (windowID) => {
            return await this.Ready2.AddWriteTask(async () => {
                this.UnmanagedWindows.delete(windowID);
                if (this.Windows.has(windowID)) {
                    if (this.ActiveWindowID === windowID) {
                        this.ActiveWindowID = undefined;
                    }
                    this.Windows.get(windowID).destructor();
                    this.Windows.delete(windowID);
                }
                return true;
            });
        };
        this.FocusChanged = async (windowID) => {
            return await this.Ready2.AddWriteTask(async () => {
                if (this.ActiveWindowID !== undefined) {
                    if (this.Windows.has(this.ActiveWindowID)) {
                        const myWindow = this.Windows.get(this.ActiveWindowID);
                        myWindow.Ready2.AddWriteTask(async () => {
                            myWindow.IsActive = false;
                            return true;
                        });
                    }
                    else {
                        return false;
                    }
                }
                if (windowID === -1 || this.UnmanagedWindows.has(windowID)) {
                    this.ActiveWindowID = undefined;
                }
                else {
                    if (this.Windows.has(windowID)) {
                        const myWindow = this.Windows.get(windowID);
                        myWindow.Ready2.AddWriteTask(async () => {
                            myWindow.IsActive = true;
                            return true;
                        });
                        this.ActiveWindowID = windowID;
                    }
                    else {
                        return false;
                    }
                }
                return true;
            });
        };
        this.ChangeOccured = async () => {
            this.ReadyInstances.PrepareSending();
        };
        this.Ready2 = new Ready(this);
        this.Ready2.AddVerifyTask(this.Verify);
        this.ActiveWindowID = undefined;
        this.Arrangements = new Arrangements();
        this.Windows = new MyWindows();
        this.UnmanagedWindows = new Set();
        this.Error = new SendingObjectError(this);
        this.ReadyInstances = new ReadyInstances(this);
        this.ReadyInstances.add(this.Ready2);
        this.Ready2.AddWriteTask(async () => {
            const windowsInfo = await browser.windows.getAll({ populate: false }).catch(() => {
                return undefined;
            });
            if (windowsInfo !== undefined) {
                return await this.SetWindowsInfo(windowsInfo);
            }
            else {
                return false;
            }
        });
        Object.defineProperties(this, {
            Ready2: { enumerable: false },
            Error: { enumerable: false },
            UnmanagedWindows: { enumerable: false },
            ReadyInstances: { enumerable: false }
        });
    }
}
//# sourceMappingURL=SendingObject.js.map