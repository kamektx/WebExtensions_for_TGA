class Ready {
  static readonly MaxTasks = 1000;
  private _IsReady: boolean;
  private _IsNotError: boolean;
  private _Tasks: Map<number, Promise<boolean>>;
  private _VerifyTasks: Set<() => Promise<boolean>>;
  private _TaskIndex: number;
  private _DoneTaskIndex: number;
  private _LastWriteTaskIndex: number;

  Wait = async (): Promise<boolean> => {
    for (let i = this._DoneTaskIndex + 1; i <= this._TaskIndex; i++) {
      await this._Tasks.get(i);
    }
    return this._IsNotError;
  }

  get IsReady(): boolean {
    return this._IsReady;
  }
  get IsError(): boolean {
    return !this._IsNotError;
  }
  get IsNotError(): boolean {
    return this._IsNotError;
  }

  Verify = async () => { // Call it only when the task is the last task;
    const myTaskIndex = ++this._TaskIndex;
    this._LastWriteTaskIndex = myTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
      for (const fn of this._VerifyTasks) {
        this._IsNotError = await fn();
      }
      resolve(this._IsNotError);
    }));

  }

  AddWriteTask = async (fn: () => Promise<boolean>, ifReturnFalse: ("error" | "ignore") = "ignore", ifAlreadyError: ("quit" | "force") = "quit"): Promise<boolean> => {
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
        this.Verify()
      }
      resolve(result);
    }));
    return await this._Tasks.get(myTaskIndex)!;
  }
  AddReadTask = async (fn: () => Promise<boolean>, ifReturnFalse: ("error" | "ignore") = "ignore", ifAlreadyError: ("quit" | "force") = "quit"): Promise<boolean> => {
    if (this.IsError && ifAlreadyError === "quit") {
      return false;
    }
    const myTaskIndex = ++this._TaskIndex;
    const lastWriteTaskIndex = this._LastWriteTaskIndex;
    this._Tasks.set(myTaskIndex, new Promise<boolean>(async (resolve) => {
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
        this.Verify()
      }
      resolve(result);
    }));
    return await this._Tasks.get(myTaskIndex)!;
  }
  AddVerifyTask = (fn: () => Promise<boolean>) => {
    this._VerifyTasks.add(fn);
  }
  constructor() {
    this._IsNotError = false;
    this._IsReady = true;
    this._Tasks = new Map();
    this._LastWriteTaskIndex = 0;
    this._VerifyTasks = new Set();
    this._TaskIndex = 0;
    this._DoneTaskIndex = 0;
  }
}