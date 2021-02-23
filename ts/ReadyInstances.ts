class ReadyInstances extends Set<Ready> {
  static readonly TickTime = 40;
  static readonly TimeToWait = 160;
  SendingObject: SendingObject;
  TimerMilliSeconds: number;
  IsTimerRunning: boolean;
  IsSendingJSON: boolean;

  Timer = async () => {
    while (this.TimerMilliSeconds > 0) {
      await Thread.Delay(ReadyInstances.TickTime);
      this.TimerMilliSeconds -= ReadyInstances.TickTime;
      if (!this.IsTimerRunning || app.SendingObject !== this.SendingObject) {
        return false;
      }
    }
    this.IsTimerRunning = false;
    this.SendJSON();
  }

  SendJSON = async (): Promise<boolean> => {
    this.IsSendingJSON = true;
    let promise = new Promise<boolean>(async resolve => {
      for (const ready of this) {
        const isNotError = await ready.WaitForThisReadyAndWaitForSendingJSON();
        if (isNotError === false) resolve(false);
      }
      if (this.SendingObject !== app.SendingObject) {
        resolve(false);
      }
      app.Messaging.PostMessage(this.SendingObject);

      resolve(true);
    });
    const result = await promise;
    console.log("Sent SendingObject.", result);
    this.IsSendingJSON = false;
    return result;
  }

  ResetTimer = () => {
    this.TimerMilliSeconds = ReadyInstances.TimeToWait;
  }

  PrepareSending = async () => {
    this.ResetTimer();
    if (this.IsTimerRunning === false) {
      this.IsTimerRunning = true;
      this.Timer();
    }
  }

  constructor(sendingObject: SendingObject) {
    super();
    this.SendingObject = sendingObject;
    this.IsTimerRunning = false;
    this.TimerMilliSeconds = 0;
    this.IsSendingJSON = false;
  }
}