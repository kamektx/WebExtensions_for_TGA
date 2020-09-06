"use strict";
class ScreenShot {
    constructor(myTab) {
        this.Capture = async () => {
            await this.SetTabInformation();
            this.IsCaputured = true;
            this.Data = await browser.tabs.captureVisibleTab(this.MyTab.WindowID, { format: this.Format, quality: ScreenShot.Quality }).catch(() => {
                this.IsCaputured = false;
                return undefined;
            });
            if (this.IsCaputured === true) {
                this.CreateID();
            }
            this.ResetTimer();
            this.SendJSON(); // DON'T AWAIT!!
            return this.IsCaputured;
        };
        this.CheckTabUpdated = async () => {
            return this.MyTab.Ready2.AddReadTask(async () => {
                return this.TabURL !== this.MyTab.URL ||
                    this.TabStatus !== this.MyTab.Status ||
                    this.TabTitle !== this.MyTab.Title;
            });
        };
        this.Recapture = async () => {
            return await this.Ready2.AddWriteTask(async () => {
                if (this.IsCaputured === false) {
                    const result = await this.Capture();
                    this.IsFirstTime = true;
                    return result;
                }
                if (await this.CheckTabUpdated()) {
                    const result = await this.Capture();
                    this.IsFirstTime = true;
                    return result;
                }
                if (this.IsFirstTime) {
                    this.FirstTimeMilliSeconds -= ScreenCaptureTimer.TickTime;
                }
                else if (this.MyTab.WindowID === this.SendingObject.ActiveWindowID) {
                    this.ActiveWindowMilliSeconds -= ScreenCaptureTimer.TickTime;
                }
                else {
                    this.InactiveWindowMilliSeconds -= ScreenCaptureTimer.TickTime;
                }
                if (this.FirstTimeMilliSeconds <= 0 ||
                    this.ActiveWindowMilliSeconds <= 0 ||
                    this.InactiveWindowMilliSeconds <= 0) {
                    const result = await this.Capture();
                    this.IsFirstTime = false;
                    return result;
                }
                return true;
            });
        };
        this.SetTabInformation = async () => {
            return await this.MyTab.Ready2.AddReadTask(async () => {
                this.TabID = this.MyTab.TabID;
                this.TabURL = this.MyTab.URL;
                this.TabStatus = this.MyTab.Status;
                this.TabTitle = this.MyTab.Title;
                return true;
            });
        };
        this.SendJSON = async () => {
            return await this.Ready2.AddReadTask(async () => {
                if (this.IsCaputured) {
                    const obj = {
                        FileName: this.ID + "." + this.Format,
                        Data: this.Data
                    };
                    app.Port.postMessage(obj);
                }
                return true;
            });
        };
        this.Ready2 = new Ready();
        this.Format = "jpeg";
        this.IsFirstTime = true;
        this.IsCaputured = true;
        this.ActiveWindowMilliSeconds = 0;
        this.FirstTimeMilliSeconds = 0;
        this.InactiveWindowMilliSeconds = 0;
        this.SendingObject = app.SendingObject;
        this.MyTab = myTab;
        this.Ready2.AddWriteTask(async () => {
            return await this.Capture();
        }, "ignore");
    }
    CreateID() {
        const randomArray = new Uint32Array(4);
        window.crypto.getRandomValues(randomArray);
        this.ID = this.EncodeBase32(randomArray);
    }
    EncodeBase32(randomArray) {
        const encodingTable = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
            'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
            'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
            'Y', 'Z', '2', '3', '4', '5', '6', '7'
        ];
        let str = "";
        const ra = randomArray;
        const m = 5;
        const n = 32;
        const l = ra.length;
        let i = 0;
        let j = n;
        while (i < l) {
            let a = ra[i] % (2 ** j);
            let b = 0;
            if (j - m < 0) {
                a <<= m - j;
                i++;
                if (i < l) {
                    j = j - m + n;
                    b = ra[i] >> j;
                }
            }
            else {
                j = j - m;
                a >>= j;
            }
            const val = a + b;
            if (val < 2 ** m) {
                str += encodingTable[a + b];
            }
            else {
                throw new Error("Base32 encode error.");
            }
        }
        return str;
    }
    toJSON() {
        return this.ID + "." + this.Format;
    }
    ResetTimer() {
        this.ActiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureActiveWindow;
        this.FirstTimeMilliSeconds = ScreenCaptureTimer.TimeToRecaptureFirstTime;
        this.InactiveWindowMilliSeconds = ScreenCaptureTimer.TimeToRecaptureInactiveWindow;
    }
}
ScreenShot.Quality = 80;
//# sourceMappingURL=ScreenShot.js.map