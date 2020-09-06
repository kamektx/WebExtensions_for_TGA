declare class Ready {
    static readonly MaxTasks = 1000;
    private _IsReady;
    private _Tasks;
    private _VerifyTasks;
    private _TaskIndex;
    private _DoneTaskIndex;
    private _LastWriteTaskIndex;
    IsNotError: boolean;
    Wait: () => Promise<boolean>;
    get IsReady(): boolean;
    get IsError(): boolean;
    Verify: () => Promise<void>;
    AddWriteTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    AddReadTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    AddReadTaskAny: <T>(fn: () => Promise<T>, ifAlreadyError?: ("quit" | "force")) => Promise<T | undefined>;
    AddVerifyTask: (fn: () => Promise<boolean>) => void;
    constructor();
}
//# sourceMappingURL=Ready.d.ts.map