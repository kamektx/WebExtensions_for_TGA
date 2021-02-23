interface MessageResponse {
  ReceivedIndex: number
}

class Messaging {
  private Port: browser.runtime.Port;
  static readonly MaxTasks = 1000;
  private _Tasks: Map<number, object>;
  private _TaskIndex: number;
  private ReceivedIndex: number;

  private ExecutePostMessage(obj: object, index: number) {
    this.Port.postMessage({ SendingIndex: index, Content: obj });
  }

  PostMessage = (obj: object): void => {
    const myTaskIndex = ++this._TaskIndex;
    if (this.ReceivedIndex == myTaskIndex - 1) {
      this.ExecutePostMessage(obj, myTaskIndex);
      return;
    } else {
      this._Tasks.set(myTaskIndex, obj);
      return;
    }
  }

  constructor() {
    this.ReceivedIndex = 0;
    this._Tasks = new Map();
    this._TaskIndex = 0;
    this.Port = browser.runtime.connectNative("TGA_NativeMessaging_Cliant");
    this.Port.onMessage.addListener((response) => {
      const responseCasted = response as MessageResponse;
      const receivedIndex = responseCasted.ReceivedIndex;
      this.ReceivedIndex = receivedIndex;
      if (this._Tasks.has(receivedIndex + 1)) {
        this.ExecutePostMessage(this._Tasks.get(receivedIndex + 1)!, receivedIndex + 1);
        this._Tasks.delete(receivedIndex + 1);
      }
      console.log("ReceivedIndex: " + receivedIndex);
    });
  }
}