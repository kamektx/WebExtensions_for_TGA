class ScreenCaptureTimer {
  static readonly TickTime = 3 * 1000;
  static readonly TimeToRecaptureActiveWindow = 30 * 1000;
  static readonly TimeToRecaptureFirstTime = 5 * 1000;
  static readonly TimeToRecaptureInactiveWindow = 180 * 1000;
  Go: boolean;

  Run = async () => {
    loop1: while (this.Go) {
      await Thread.Delay(ScreenCaptureTimer.TickTime);
      if (await app.SendingObject.Ready === false) {
        continue;
      }
      for (const myWindow of app.SendingObject.Windows.values()) {
        if (await myWindow.Ready === false) {
          continue loop1;
        }
        if (myWindow.ActiveTabID !== undefined) {
          if (myWindow.Tabs.has(myWindow.ActiveTabID)) {
            const myTab = myWindow.Tabs.get(myWindow.ActiveTabID)!;
            if (await myTab.Ready === false) {
              continue loop1;
            }
            if (myTab.ScreenShot === undefined) {
              myTab.ScreenShot = new ScreenShot(myTab);
            }
          } else {
            myWindow.IsNotError = false;
            myWindow.Verify();
            break;
          }

        }
      }

    }
  }
  constructor(sendingObject: SendingObject) {
    this.Go = true;
    this.Run();
  }
}