const app = new App();
const isEventActive = true;

if (isEventActive) {
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
    switch (await app.SendingObject.HasWindowID(activeInfo.windowId)) {
      case "false":
        app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + activeInfo.windowId + ". : tabs.onActivated");
        return;
      case "managed":
        app.SendingObject.Windows.get(activeInfo.windowId)?.ActiveTabChanged(activeInfo.tabId);
        break;
    }
  });
  browser.tabs.onAttached.addListener(async (tabID, attachInfo) => {
    console.log("tabs.onAttached");
    switch (await app.SendingObject.HasWindowID(attachInfo.newWindowId)) {
      case "false":
        break;
      case "managed":
        app.SendingObject.Windows.get(attachInfo.newWindowId)?.AttachTab(tabID);
        break;
    }
  });
  browser.tabs.onDetached.addListener(async (tabID, detachInfo) => {
    console.log("tabs.onDetached");
    switch (await app.SendingObject.HasWindowID(detachInfo.oldWindowId)) {
      case "false":
        app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + detachInfo.oldWindowId + ". : tabs.onDetached");
        return;
      case "managed":
        app.SendingObject.Windows.get(detachInfo.oldWindowId)?.DetachTab(tabID);
        break;
    }
  });
  browser.tabs.onCreated.addListener(async (tabInfo) => {
    console.log("tabs.onCreated");
    if (tabInfo.windowId === undefined) {
      throw new Error("Couldn't get the windowID");
    }
    switch (await app.SendingObject.HasWindowID(tabInfo.windowId!)) {
      case "false":
        app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + tabInfo.windowId + ". : tabs.onCreated");
        return;
      case "managed":
        app.SendingObject.Windows.get(tabInfo.windowId)?.CreateTab(tabInfo);
        break;
    }
  });
  browser.tabs.onMoved.addListener(async (tabID, moveInfo) => {
    console.log("tabs.onMoved");
    if (moveInfo.windowId === undefined) {
      throw new Error("Couldn't get the windowID");
    }
    switch (await app.SendingObject.HasWindowID(moveInfo.windowId!)) {
      case "false":
        app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + moveInfo.windowId + ". : tabs.onMoved");
        return;
      case "managed":
        app.SendingObject.Windows.get(moveInfo.windowId)?.MoveTab();
        break;
    }
  });
  browser.tabs.onRemoved.addListener(async (tabID, removeInfo) => {
    console.log("tabs.onRemoved");
    if (removeInfo.windowId === undefined) {
      throw new Error("Couldn't get the windowID");
    }
    switch (await app.SendingObject.HasWindowID(removeInfo.windowId!)) {
      case "false":
        app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + removeInfo.windowId + ". : tabs.onRemoved");
        return;
      case "managed":
        if (removeInfo.isWindowClosing === false) {
          app.SendingObject.Windows.get(removeInfo.windowId)?.RemoveTab(tabID);
        }
        break;
    }
  });
  chrome.tabs.onReplaced.addListener(async (addedTabID, removedTabID) => {
    console.log("tabs.onReplaced");
    const myWindow = await app.SendingObject.FindWindowWhichHasTheTabID(removedTabID);
    if (myWindow === undefined) {
      app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the window which has the TabID " + removedTabID + ". : tabs.onReplaced");
      return;
    }
    myWindow.ReplaceTab(addedTabID, removedTabID);
  });


  browser.tabs.onUpdated.addListener(async (tabID, changeInfo, tabInfo) => {
    if (tabInfo.windowId === undefined) {
      throw new Error("Couldn't get the windowID");
    }
    const shouldUpdate: boolean = changeInfo.url !== undefined ||
      changeInfo.title !== undefined ||
      changeInfo.pinned !== undefined ||
      changeInfo.hidden !== undefined ||
      changeInfo.status !== undefined;
    if (shouldUpdate) {
      console.log("tabs.onUpdated");
      console.log(changeInfo);
      switch (await app.SendingObject.HasWindowID(tabInfo.windowId!)) {
        case "false":
          app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + tabInfo.windowId + ". : tabs.onUpdated");
          return;
        case "managed":
          app.SendingObject.Windows.get(tabInfo.windowId)!.UpdateTab(tabID);
          break;
      }
    }
  });
}



app.Port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

browser.browserAction.onClicked.addListener(async () => {
  // console.log("Sending: ping");
  // app.Port.postMessage("ping" as any);
  console.log(app.SendingObject);
  console.log(JSON.stringify(app.SendingObject));
});

