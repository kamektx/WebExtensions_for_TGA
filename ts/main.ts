

const updateJson = (responce: JSON) => {

}

app.Port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

browser.browserAction.onClicked.addListener(() => {
  console.log("Sending: ping");
  app.Port.postMessage("ping" as any);
});

