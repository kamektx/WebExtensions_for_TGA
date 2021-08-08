let app: App;
type InitErrorT = ("" | "NotInstalled" | "NoBrowserName");
let initError: InitErrorT = "";


browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.From) {
    case "options":
      switch (message.Command) {
        case "requestBrowserName":
          const obj = {
            Type: "RequestBrowserName"
          }
          app.Messaging.PostMessage(obj);
          console.log("Sent RequestBrowserName");
          break;
        case "initError":
          sendResponse(initError);
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }
});

const ActivateEvents = () => {
  browser.windows.onCreated.addListener(async (windowInfo: browser.windows.Window) => {
    console.log("windows.onCreated");
    app.SendingObject.AddWindow(windowInfo);
  });
  browser.windows.onRemoved.addListener(async (windowID: number) => {
    console.log("windows.onRemoved");
    app.SendingObject.RemoveWindow(windowID);
  });
  browser.windows.onFocusChanged.addListener(async (windowID: number) => {
    console.log("windows.onFocusChanged : WindowID " + windowID);
    switch (app.ChromiumOrGecko) {
      case "Gecko":
        app.SendingObject.FocusChanged(windowID);
        break;
      case "Chromium":
        app.SendingObject.CheckFocused();
        break;
    }
  });

  browser.tabs.onActivated.addListener(async (activeInfo) => {
    console.log("tabs.onActivated");
    for (let i = 2; i > 0; i--) {
      switch (await app.SendingObject.HasWindowID(activeInfo.windowId)) {
        case "false":
          if (i > 1) {
            await Thread.Delay(10);
            break;
          }
          app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + activeInfo.windowId + ". : tabs.onActivated");
          return;
        case "managed":
          app.SendingObject.Windows.get(activeInfo.windowId)?.ActiveTabChanged(activeInfo.tabId);
          i = 0;
          break;
      }
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
    if (tabInfo.windowId == undefined) {
      throw new Error("Couldn't get the windowID");
    }
    for (let i = 2; i > 0; i--) {
      switch (await app.SendingObject.HasWindowID(tabInfo.windowId!)) {
        case "false":
          if (i > 1) {
            await Thread.Delay(10);
            break;
          }
          app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + tabInfo.windowId + ". : tabs.onCreated");
          return;
        case "managed":
          app.SendingObject.Windows.get(tabInfo.windowId)?.CreateTab(tabInfo);
          i = 0;
          break;
      }
    }
  });
  browser.tabs.onMoved.addListener(async (tabID, moveInfo) => {
    console.log("tabs.onMoved");
    if (moveInfo.windowId == undefined) {
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
    if (removeInfo.windowId == undefined) {
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
    if (myWindow == undefined) {
      app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the window which has the TabID " + removedTabID + ". : tabs.onReplaced");
      return;
    }
    myWindow.ReplaceTab(addedTabID, removedTabID);
  });


  browser.tabs.onUpdated.addListener(async (tabID, changeInfo, tabInfo) => {
    if (tabInfo.windowId == undefined) {
      throw new Error("Couldn't get the windowID");
    }
    const shouldUpdate: boolean = changeInfo.url != undefined ||
      changeInfo.title != undefined ||
      changeInfo.pinned != undefined ||
      changeInfo.hidden != undefined ||
      changeInfo.status != undefined;
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
    if (changeInfo.favIconUrl != undefined) {
      console.log("tabs.onUpdated (Favicon)");
      switch (await app.SendingObject.HasWindowID(tabInfo.windowId!)) {
        case "false":
          app.SendingObject.Error.ThrowError("SendingObject : Couldn't find the WindowID " + tabInfo.windowId + ". : tabs.onUpdated");
          return;
        case "managed":
          app.SendingObject.Windows.get(tabInfo.windowId)!.UpdateTabFavicon(tabID, changeInfo.favIconUrl);
          break;
      }
    }
  });
}

browser.browserAction.setTitle({
  title: "Press to Reset"
});

browser.browserAction.onClicked.addListener(async () => {
  if (!app.IsAppInited) return;
  app.Messaging.Dispose();
  await Thread.Delay(500);
  app.Messaging = new Messaging();
  app.SendingObject.Error.ThrowError("ResetButton was pressed.");
});


const init = async (): Promise<boolean> => {
  app = new App();
  await Thread.Delay(100);
  if (!app.Messaging.IsPortOK()) {
    initError = "NotInstalled";
    browser.tabs.create({ active: true, url: "/options.html" });
    return false;
  }

  const browserName = await browser.storage.local.get("BrowserName");
  if (browserName.BrowserName == undefined) {
    initError = "NoBrowserName";
    browser.tabs.create({ active: true, url: "/options.html" });
    return false;
  }

  app.BrowserName = browserName.BrowserName;
  app.AppInit();
  return true;
}

init();

