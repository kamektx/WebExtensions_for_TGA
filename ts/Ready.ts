class Ready {
  static readonly MaxTasks = 500;
  private _IsReady: boolean;
  private _Tasks: Map<number, Promise<any>>;
  private _VerifyTasks: Array<() => Promise<boolean>>;
  private _TaskIndex: number;
  private _DoneTaskIndex: number;
  private _LastWriteTaskIndex: number;
  private _WriteAccess: boolean;
  private _IsNotyfyChange: boolean;
  private _MyObject: any;
  private _TaskStat = new Map<string, number>();
  IsNotError: boolean;
  SendingObject: SendingObject;

  get IsReady(): boolean {
    return this._IsReady;
  }
  get IsError(): boolean {
    return !this.IsNotError;
  }

  private ManageTasks = (taskIndex: number, taskName: string) => {
    if (taskIndex > Ready.MaxTasks) {
      this._Tasks.delete(taskIndex - Ready.MaxTasks);
    }
    if (this._TaskStat.has(taskName)) {
      this._TaskStat.set(taskName, this._TaskStat.get(taskName)! + 1);
    } else {
      this._TaskStat.set(taskName, 1);
    }
  }

  Verify = () => { // Call it only when the task is the last task;
    this._IsReady = false;
    const myTaskIndex = ++this._TaskIndex;
    this._LastWriteTaskIndex = myTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
      for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
        await this._Tasks.get(i);
      }
      for (const fn of this._VerifyTasks) {
        this.IsNotError = await fn() && this.IsNotError;
      }
      this._DoneTaskIndex = myTaskIndex;
      if (myTaskIndex > Ready.MaxTasks) {
        this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
      }
      this.ManageTasks(myTaskIndex, "Verify");
      if (this._TaskIndex === myTaskIndex) {
        this._IsReady = true;
        if (this._IsNotyfyChange && this._WriteAccess) {
          this.NotifyChange();
        }
        this._WriteAccess = false;
      }
      resolve(this.IsNotError);
    }));
  }

  AddWriteTask = async (fn: () => Promise<boolean>, ifReturnFalse: ("error" | "ignore" | "retry") = "error", ifAlreadyError: ("quit" | "force") = "quit", taskName: string = "UnknownWriteTask"): Promise<boolean> => {
    if (this.IsError && ifAlreadyError === "quit") {
      return false;
    }
    this._IsReady = false;
    const myTaskIndex = ++this._TaskIndex;
    this._LastWriteTaskIndex = myTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
      for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
        await this._Tasks.get(i);
        if (this.IsError && ifAlreadyError === "quit") {
          resolve(false);
        }
      }
      const result = await fn();
      this._WriteAccess = true;
      this._DoneTaskIndex = myTaskIndex;
      this.ManageTasks(myTaskIndex, taskName);
      if (ifReturnFalse === "error" && result === false) {
        this.IsNotError = false;
      }
      resolve(result);
    }));
    const result = await this._Tasks.get(myTaskIndex)!;
    if (this._TaskIndex === myTaskIndex) {
      this.Verify()
    }
    return result;
  }
  AddReadTask = async (fn: () => Promise<boolean>, ifReturnFalse: ("error" | "ignore") = "error", ifAlreadyError: ("quit" | "force") = "quit", taskName: string = "UnknownReadTask"): Promise<boolean> => {
    if (this.IsError && ifAlreadyError === "quit") {
      return false;
    }
    const myTaskIndex = ++this._TaskIndex;
    const lastWriteTaskIndex = this._LastWriteTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
      for (let i = this._DoneTaskIndex + 1; i <= lastWriteTaskIndex; i++) {
        await this._Tasks.get(i);
        if (this.IsError && ifAlreadyError === "quit") {
          resolve(false);
        }
      }
      const result = await fn();
      this.ManageTasks(myTaskIndex, taskName);
      if (ifReturnFalse === "error" && result === false) {
        this.IsNotError = false;
      }
      resolve(result);
    }));
    const result = await this._Tasks.get(myTaskIndex)!;
    if (this._TaskIndex === myTaskIndex) {
      this.Verify()
    }
    return result;
  }
  // WaitForThisReadyAndWaitForSendingJSON = async (): Promise<boolean> => {
  //   this._IsReady = false;
  //   const myTaskIndex = this._TaskIndex += 2;
  //   this._LastWriteTaskIndex = myTaskIndex;
  //   this._Tasks.set(myTaskIndex - 1, new Promise<boolean>(async (resolve) => {
  //     for (let i = this._DoneTaskIndex + 1; i < myTaskIndex - 1; i++) {
  //       await this._Tasks.get(i);
  //     }
  //     this._DoneTaskIndex = myTaskIndex - 1;
  //     if (myTaskIndex - 1 > Ready.MaxTasks) {
  //       this._Tasks.delete(myTaskIndex - 1 - Ready.MaxTasks);
  //     }
  //     resolve(this.IsNotError);
  //   }));
  //   this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
  //     for (let i = this._DoneTaskIndex + 1; i < myTaskIndex; i++) {
  //       await this._Tasks.get(i);
  //     }
  //     while (this.SendingObject.ReadyInstances.IsSendingJSON) {
  //       await Thread.Delay(20);
  //     }
  //     this._DoneTaskIndex = myTaskIndex;
  //     if (myTaskIndex > Ready.MaxTasks) {
  //       this._Tasks.delete(myTaskIndex - Ready.MaxTasks);
  //     }
  //     resolve(true);
  //   }));
  //   const result = await this._Tasks.get(myTaskIndex - 1)!;
  //   if (this._TaskIndex === myTaskIndex) {
  //     this.Verify()
  //   }
  //   return result;
  // }
  AddReadTaskAny = async <T>(fn: () => Promise<T>, ifAlreadyError: ("quit" | "force") = "quit", taskName: string = "UnknownReadTaskAny"): Promise<T | undefined> => {
    if (this.IsError && ifAlreadyError === "quit") {
      return undefined;
    }
    const myTaskIndex = ++this._TaskIndex;
    const lastWriteTaskIndex = this._LastWriteTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<T>(async (resolve) => {
      for (let i = this._DoneTaskIndex + 1; i <= lastWriteTaskIndex; i++) {
        await this._Tasks.get(i);
        if (this.IsError && ifAlreadyError === "quit") {
          resolve(undefined as any);
        }
      }
      const result = await fn();
      this.ManageTasks(myTaskIndex, taskName);
      resolve(result);
    }));
    const result = await this._Tasks.get(myTaskIndex)!;
    if (this._TaskIndex === myTaskIndex) {
      this.Verify()
    }
    return result;
  }

  AddVerifyTask = (fn: () => Promise<boolean>, position: ("first" | "last") = "first") => {
    if (position === "first") {
      this._VerifyTasks.unshift(fn);
    } else {
      this._VerifyTasks.push(fn);
    }
  }

  NotifyChange = () => {
    this.SendingObject.ChangeOccured()
    return true;
  }

  constructor(sendingObject: SendingObject, readyObject: any, isNotifyChange: boolean = true) {
    this.IsNotError = true;
    this._IsReady = true;
    this._MyObject = readyObject;
    this._Tasks = new Map();
    this._LastWriteTaskIndex = 0;
    this._VerifyTasks = new Array();
    this._TaskIndex = 0;
    this._DoneTaskIndex = 0;
    this._WriteAccess = false;
    this.SendingObject = sendingObject;
    this._IsNotyfyChange = isNotifyChange;
  }
}