

const updateJson = (responce: JSON) => {

}

port.onMessage.addListener((response) => {
  console.log("Received: " + response);
});

browser.browserAction.onClicked.addListener(() => {
  console.log("Sending: ping");
  port.postMessage("ping" as any);
});

