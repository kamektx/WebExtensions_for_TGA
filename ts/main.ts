const app = new App();

browser.windows.onCreated.addListener(async (windowInfo: browser.windows.Window) => {
  console.log("windows.onCreated");
  app.SendingObject.AddWindow(windowInfo);
});
browser.windows.onRemoved.addListener(async (windowID: number) => {
  console.log("windows.onRemoved");
  app.SendingObject.RemoveWindow(windowID);
});
browser.windows.onFocusChanged.addListener(async (windowID: number) => {
  console.log("windows.onFocusChanged");
  app.SendingObject.FocusChanged(windowID);
});

browser.tabs.onActivated.addListener(async (activeInfo) => {
  console.log("tabs.onActivated");
  if (app.SendingObject.Windows.has(activeInfo.windowId) === false) {
    app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + activeInfo.windowId + ". : onActivated");
    return;
  }
  app.SendingObject.Windows.get(activeInfo.windowId)?.ActiveTabChanged(activeInfo.tabId);
});
browser.tabs.onAttached.addListener(async (tabID, attachInfo) => {
  console.log("tabs.onAttached");
  if (app.SendingObject.Windows.has(attachInfo.newWindowId) === false) {
    app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + attachInfo.newWindowId + ". : onAttached");
    return;
  }
  app.SendingObject.Windows.get(attachInfo.newWindowId)?.AttachTab(tabID);
});
browser.tabs.onDetached.addListener(async (tabID, detachInfo) => {
  console.log("tabs.onDetached");
  if (app.SendingObject.Windows.has(detachInfo.oldWindowId) === false) {
    app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + detachInfo.oldWindowId + ". : onDetached");
    return;
  }
  app.SendingObject.Windows.get(detachInfo.oldWindowId)?.DetachTab(tabID);
});
browser.tabs.onCreated.addListener(async (tabInfo) => {
  console.log("tabs.onCreated");
  if (tabInfo.windowId === undefined){
    throw new Error("Couldn't get the windowID");
  }
  if (app.SendingObject.Windows.has(tabInfo.windowId!) === false) {
    app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + tabInfo.windowId + ". : onCreated");
    return;
  }
  app.SendingObject.Windows.get(tabInfo.windowId)?.CreateTab(tabInfo);
});
browser.tabs.onMoved.addListener(async (tabID, moveInfo) => {
  console.log("tabs.onMoved");
  if (moveInfo.windowId === undefined){
    throw new Error("Couldn't get the windowID");
  }
  if (app.SendingObject.Windows.has(moveInfo.windowId!) === false) {
    app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + moveInfo.windowId + ". : onMoved");
    return;
  }
  app.SendingObject.Windows.get(moveInfo.windowId)?.MoveTab();
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

