"use strict";
const app = new App();
browser.windows.onCreated.addListener(async (windowInfo) => {
    app.SendingObject.AddWindow(windowInfo);
});
browser.windows.onRemoved.addListener(async (windowID) => {
    app.SendingObject.RemoveWindow(windowID);
});
browser.windows.onFocusChanged.addListener(async (windowID) => {
    app.SendingObject.FocusChanged(windowID);
});
browser.tabs.onActivated.addListener(async (activeInfo) => {
    var _a;
    if (app.SendingObject.Windows.get(activeInfo.windowId) === undefined) {
        app.SendingObject.Error.ThrowError();
        return;
    }
    (_a = app.SendingObject.Windows.get(activeInfo.windowId)) === null || _a === void 0 ? void 0 : _a.ActiveTabChanged(activeInfo.tabId);
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