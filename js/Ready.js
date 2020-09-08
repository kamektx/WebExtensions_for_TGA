"use strict";
class Ready {
    constructor(sendingObject, isNotifyChange = true) {
        this.Verify = async () => {
            this._IsReady = false;
            const myTaskIndex = ++this._TaskIndex;
            this._LastWriteTaskIndex = myTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
                    await this._Tasks.get(i);
                }
                for (const fn of this._VerifyTasks) {
                    this.IsNotError = this.IsNotError && await fn();
                }
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (this._TaskIndex === myTaskIndex) {
                    this._IsReady = true;
                    if (this._IsNotyfyChange && this._WriteAccess) {
                        this.NotifyChange();
                    }
                    this._WriteAccess = false;
                }
                resolve(this.IsNotError);
            }));
        };
        this.AddWriteTask = async (fn, ifReturnFalse = "error", ifAlreadyError = "quit") => {
            if (this.IsError && ifAlreadyError === "quit") {
                return false;
            }
            this._IsReady = false;
            const myTaskIndex = ++this._TaskIndex;
            this._LastWriteTaskIndex = myTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
                    await this._Tasks.get(i);
                    if (this.IsError && ifAlreadyError === "quit") {
                        resolve(false);
                    }
                }
                const result = await fn();
                this._WriteAccess = true;
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this.IsNotError = false;
                }
                resolve(result);
            }));
            const result = await this._Tasks.get(myTaskIndex);
            if (this._TaskIndex === myTaskIndex) {
                this.Verify();
            }
            return result;
        };
        this.AddReadTask = async (fn, ifReturnFalse = "error", ifAlreadyError = "quit") => {
            if (this.IsError && ifAlreadyError === "quit") {
                return false;
            }
            const myTaskIndex = ++this._TaskIndex;
            const lastWriteTaskIndex = this._LastWriteTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i <= lastWriteTaskIndex; i++) {
                    await this._Tasks.get(i);
                    if (this.IsError && ifAlreadyError === "quit") {
                        resolve(false);
                    }
                }
                const result = await fn();
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this.IsNotError = false;
                }
                resolve(result);
            }));
            const result = await this._Tasks.get(myTaskIndex);
            if (this._TaskIndex === myTaskIndex) {
                this.Verify();
            }
            return result;
        };
        this.WaitForThisReadyAndWaitForSendingJSON = async () => {
            this._IsReady = false;
            const myTaskIndex = this._TaskIndex += 2;
            this._LastWriteTaskIndex = myTaskIndex;
            this._Tasks.set(myTaskIndex - 1, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i < myTaskIndex - 1; i++) {
                    await this._Tasks.get(i);
                }
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                resolve(this.IsNotError);
            }));
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
                    await this._Tasks.get(i);
                }
                while (this.SendingObject.ReadyInstances.IsSendingJSON) {
                    await Thread.Delay(20);
                }
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                resolve(true);
            }));
            const result = await this._Tasks.get(myTaskIndex - 1);
            if (this._TaskIndex === myTaskIndex) {
                this.Verify();
            }
            return result;
        };
        this.AddReadTaskAny = async (fn, ifAlreadyError = "quit") => {
            if (this.IsError && ifAlreadyError === "quit") {
                return undefined;
            }
            const myTaskIndex = ++this._TaskIndex;
            const lastWriteTaskIndex = this._LastWriteTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i <= lastWriteTaskIndex; i++) {
                    await this._Tasks.get(i);
                    if (this.IsError && ifAlreadyError === "quit") {
                        resolve(undefined);
                    }
                }
                const result = await fn();
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                resolve(result);
            }));
            const result = await this._Tasks.get(myTaskIndex);
            if (this._TaskIndex === myTaskIndex) {
                this.Verify();
            }
            return result;
        };
        this.AddVerifyTask = (fn, position = "first") => {
            if (position === "first") {
                this._VerifyTasks.unshift(fn);
            }
            else {
                this._VerifyTasks.push(fn);
            }
        };
        this.NotifyChange = () => {
            this.SendingObject.ChangeOccured();
            return true;
        };
        this.IsNotError = true;
        this._IsReady = true;
        this._Tasks = new Map();
        this._LastWriteTaskIndex = 0;
        this._VerifyTasks = new Array();
        this._TaskIndex = 0;
        this._DoneTaskIndex = 0;
        this._WriteAccess = false;
        this.SendingObject = sendingObject;
        this._IsNotyfyChange = isNotifyChange;
    }
    get IsReady() {
        return this._IsReady;
    }
    get IsError() {
        return !this.IsNotError;
    }
}
Ready.MaxTasks = 1000;
//# sourceMappingURL=Ready.js.map