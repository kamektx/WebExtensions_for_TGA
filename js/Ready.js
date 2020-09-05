"use strict";
class Ready {
    constructor() {
        this.Wait = async () => {
            for (let i = this._DoneTaskIndex + 1; i <= this._TaskIndex; i++) {
                await this._Tasks.get(i);
            }
            return this._IsNotError;
        };
        this.Verify = async () => {
            const myTaskIndex = ++this._TaskIndex;
            this._LastWriteTaskIndex = myTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (const fn of this._VerifyTasks) {
                    this._IsNotError = await fn();
                }
                resolve(this._IsNotError);
            }));
        };
        this.AddWriteTask = async (fn, ifReturnFalse = "ignore", ifAlreadyError = "quit") => {
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
                        return false;
                    }
                }
                const result = await fn();
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this._IsNotError = false;
                }
                if (this._TaskIndex === myTaskIndex) {
                    this.Verify();
                }
                resolve(result);
            }));
            return await this._Tasks.get(myTaskIndex);
        };
        this.AddReadTask = async (fn, ifReturnFalse = "ignore", ifAlreadyError = "quit") => {
            if (this.IsError && ifAlreadyError === "quit") {
                return false;
            }
            const myTaskIndex = ++this._TaskIndex;
            const lastWriteTaskIndex = this._LastWriteTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i <= lastWriteTaskIndex; i++) {
                    await this._Tasks.get(i);
                    if (this.IsError && ifAlreadyError === "quit") {
                        return false;
                    }
                }
                const result = await fn();
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this._IsNotError = false;
                }
                if (this._TaskIndex === myTaskIndex) {
                    this.Verify();
                }
                resolve(result);
            }));
            return await this._Tasks.get(myTaskIndex);
        };
        this.AddVerifyTask = (fn) => {
            this._VerifyTasks.add(fn);
        };
        this._IsNotError = false;
        this._IsReady = true;
        this._Tasks = new Map();
        this._LastWriteTaskIndex = 0;
        this._VerifyTasks = new Set();
        this._TaskIndex = 0;
        this._DoneTaskIndex = 0;
    }
    get IsReady() {
        return this._IsReady;
    }
    get IsError() {
        return !this._IsNotError;
    }
    get IsNotError() {
        return this._IsNotError;
    }
}
Ready.MaxTasks = 1000;
//# sourceMappingURL=Ready.js.map