"use strict";
class Ready {
    constructor() {
        this.Wait = async () => {
            for (let i = this._DoneTaskIndex + 1; i <= this._TaskIndex; i++) {
                await this._Tasks.get(i);
            }
            return this.IsNotError;
        };
        this.Verify = async () => {
            this._IsReady = false;
            const myTaskIndex = ++this._TaskIndex;
            this._LastWriteTaskIndex = myTaskIndex;
            this._Tasks.set(myTaskIndex, new Promise(async (resolve) => {
                for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
                    await this._Tasks.get(i);
                }
                for (const fn of this._VerifyTasks) {
                    this.IsNotError = await fn();
                }
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (this._TaskIndex === myTaskIndex) {
                    this._IsReady = true;
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
                        return false;
                    }
                }
                const result = await fn();
                this._DoneTaskIndex = myTaskIndex;
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this.IsNotError = false;
                }
                if (this._TaskIndex === myTaskIndex) {
                    this.Verify();
                }
                resolve(result);
            }));
            return await this._Tasks.get(myTaskIndex);
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
                        return false;
                    }
                }
                const result = await fn();
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
                }
                if (ifReturnFalse === "error" && result === false) {
                    this.IsNotError = false;
                }
                if (this._TaskIndex === myTaskIndex) {
                    this.Verify();
                }
                resolve(result);
            }));
            return await this._Tasks.get(myTaskIndex);
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
                        return false;
                    }
                }
                const result = await fn();
                if (myTaskIndex > Ready.MaxTasks) {
                    this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
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
        this.IsNotError = true;
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
        return !this.IsNotError;
    }
}
Ready.MaxTasks = 1000;
//# sourceMappingURL=Ready.js.map