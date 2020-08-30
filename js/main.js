"use strict";
const updateJson = (responce) => {
};
port.onMessage.addListener((response) => {
    console.log("Received: " + response);
});
browser.browserAction.onClicked.addListener(() => {
    console.log("Sending: ping");
    port.postMessage("ping");
});
//# sourceMappingURL=main.js.map