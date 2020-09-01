"use strict";
const app = new App();
app.SendingObject = new SendingObject();
browser.windows.onCreated.addListener(async (windowInfo) => {
    var _a;
    (_a = app.SendingObject) === null || _a === void 0 ? void 0 : _a.AddWindow(windowInfo);
});
browser.windows.onRemoved.addListener(async (windowID) => {
    var _a;
    (_a = app.SendingObject) === null || _a === void 0 ? void 0 : _a.RemoveWindow(windowID);
});
browser.windows.onFocusChanged.addListener(async (windowID) => {
    var _a;
    (_a = app.SendingObject) === null || _a === void 0 ? void 0 : _a.FocusChanged(windowID);
});
app.Port.onMessage.addListener((response) => {
    console.log("Received: " + response);
});
browser.browserAction.onClicked.addListener(async () => {
    // console.log("Sending: ping");
    // app.Port.postMessage("ping" as any);
    app.SendingObject = new SendingObject();
    await Thread.Delay(200);
    console.log(app.SendingObject);
    console.log(JSON.stringify(app.SendingObject));
});
//# sourceMappingURL=main.js.map