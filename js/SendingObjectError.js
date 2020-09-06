"use strict";
class SendingObjectError {
    constructor(sendingObject) {
        this.Timer = async () => {
            while (this.TimerMilliSeconds > 0) {
                await Thread.Delay(SendingObjectError.TimerTickTime);
                this.TimerMilliSeconds -= SendingObjectError.TimerTickTime;
                if (!this.IsError || app.SendingObject !== this.SendingObject) {
                    return false;
                }
            }
            return await this.HandleError();
        };
        this.HandleError = async () => {
            app.SendingObject = new SendingObject();
            return true;
        };
        this.SendingObject = sendingObject;
        this.IsError = false;
        this.TimerMilliSeconds = 0;
    }
    ThrowError(errString) {
        app.ErrorLog.push(errString + " : " + new Date().toTimeString());
        console.log(errString + " : " + new Date().toTimeString());
        if (this.IsError) {
            this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
            return;
        }
        else {
            this.IsError = true;
            this.TimerMilliSeconds = SendingObjectError.WaitForErrorHandle;
            this.Timer();
        }
    }
}
SendingObjectError.WaitForErrorHandle = 200;
SendingObjectError.TimerTickTime = 30;
//# sourceMappingURL=SendingObjectError.js.map