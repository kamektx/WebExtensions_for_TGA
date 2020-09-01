const app = new App()
app.SendingObject = new SendingObject();

browser.windows.onCreated.addListener(async (windowInfo: browser.windows.Window) => {
  app.SendingObject?.AddWindow(windowInfo);
});
browser.windows.onRemoved.addListener(async (windowID: number)=>{
  app.SendingObject?.RemoveWindow(windowID);
});
browser.windows.onFocusChanged.addListener(async (windowID: number)=>{
  app.SendingObject?.FocusChanged(windowID);
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

