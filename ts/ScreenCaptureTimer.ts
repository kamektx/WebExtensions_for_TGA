class ScreenCaptureTimer {
  static readonly TickTime = 3 * 1000;
  static readonly TimeToRecaptureActiveWindow = 30 * 1000;
  static readonly TimeToRecaptureFirstTime = 5 * 1000;
  static readonly TimeToRecaptureInactiveWindow = 180 * 1000;
  Go: boolean;

  Run = async () => {
    while (this.Go) {
      await Thread.Delay(ScreenCaptureTimer.TickTime);
      app.SendingObject.Ready2.AddReadTask(async () => {
        for (const myWindow of app.SendingObject.Windows.values()) {
          myWindow.Ready2.AddReadTask(async () => {
            if (myWindow.ActiveTabID !== undefined) {
              if (myWindow.Tabs.has(myWindow.ActiveTabID)) {
                const myTab = myWindow.Tabs.get(myWindow.ActiveTabID)!;
                myTab.Ready2.AddWriteTask(async () => {
                  if (myTab.ScreenShot === undefined) {
                    myTab.ScreenShot = new ScreenShot(myTab);
                  } else {
                    myTab.ScreenShot.Recapture();
                  }
                  return true;
                });
              } else {
                return false;
              }
            }
            return true;
          });
        }
        return true;
      });
    }
  }
  constructor() {
    this.Go = true;
    this.Run();
  }
}