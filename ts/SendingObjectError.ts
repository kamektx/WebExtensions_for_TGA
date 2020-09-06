class SendingObjectError {
  static readonly WaitForErrorHandle = 200;
  static readonly TimerTickTime = 30;
  SendingObject: SendingObject;
  IsError: boolean;
  TimerMilliSeconds: number;

  Timer = async (): Promise<boolean> => {
    while (this.TimerMilliSeconds > 0) {
      await Thread.Delay(SendingObjectError.TimerTickTime);
      this.TimerMilliSeconds -= SendingObjectError.TimerTickTime;
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
    console.log(errString + " : " + new Date().toTimeString());
    if (this.IsError) {
      this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
      return;
    } else {
      this.IsError = true;
      this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
      this.Timer();
    }
  }
  constructor(sendingObject: SendingObject) {
    this.SendingObject = sendingObject;
    this.IsError = false;
    this.TimerMilliSeconds = 0;
  }
}