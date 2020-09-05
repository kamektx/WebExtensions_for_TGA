"use strict";
class App {
    constructor() {
        this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
        this.SendingObject = new SendingObject;
        this.ErrorLog = new Array();
    }
}
//# sourceMappingURL=class.js.map