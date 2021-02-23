class SendingObjectError {
  static readonly TimeToHandleError = 200;
  static readonly TickTime = 30;
  SendingObject: SendingObject;
  IsError: boolean;
  TimerMilliSeconds: number;

  Timer = async (): Promise<boolean> => {
    while (this.TimerMilliSeconds > 0) {
      await Thread.Delay(SendingObjectError.TickTime);
      this.TimerMilliSeconds -= SendingObjectError.TickTime;
      if (!this.IsError || app.SendingObject !== this.SendingObject) {
        return false;
      }
    }
    return await this.HandleError();
  }
  HandleError = async (): Promise<boolean> => {
    app.SendingObject = new SendingObject();
    return true;
  }
  ThrowError(errString: string) {
    app.ErrorLog.push(errString + " : " + new Date().toTimeString());
    console.log(errString);
    if (this.IsError) {
      this.TimerMilliSeconds = SendingObjectError.TimeToHandleError;
      return;
    } else {
      this.IsError = true;
      this.TimerMilliSeconds = SendingObjectError.TimeToHandleError;
      this.Timer();
    }
  }
  constructor(sendingObject: SendingObject) {
    this.SendingObject = sendingObject;
    this.IsError = false;
    this.TimerMilliSeconds = 0;
  }
}