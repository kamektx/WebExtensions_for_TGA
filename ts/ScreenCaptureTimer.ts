class ScreenCaptureTimer {
  static readonly TickTime = 3 * 1000;
  static readonly TimeToRecaptureActiveWindow = 60 * 1000;
  static readonly TimeToRecaptureFirstTime = 5 * 1000;
  static readonly TimeToRecaptureInactiveWindow = 15 * 60 * 1000;
  IsTimerRunning: boolean;

  Run = async () => {
    while (this.IsTimerRunning) {
      await Thread.Delay(ScreenCaptureTimer.TickTime);
      app.SendingObject.Ready2.AddReadTask(async () => {
        for (const myWindow of app.SendingObject.Windows.values()) {
          myWindow.Ready2.AddReadTask(async () => {
            if (myWindow.ActiveTabID !== undefined) {
              if (myWindow.Tabs.has(myWindow.ActiveTabID)) {
                const myTab = myWindow.Tabs.get(myWindow.ActiveTabID)!;
                myTab.Ready2.AddReadTask(async () => {
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
    this.IsTimerRunning = true;
    this.Run();
  }
}