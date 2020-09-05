declare class Ready {
    static readonly MaxTasks = 1000;
    private _IsReady;
    private _IsNotError;
    private _Tasks;
    private _VerifyTasks;
    private _TaskIndex;
    private _DoneTaskIndex;
    private _LastWriteTaskIndex;
    Wait: () => Promise<boolean>;
    get IsReady(): boolean;
    get IsError(): boolean;
    get IsNotError(): boolean;
    Verify: () => Promise<void>;
    AddWriteTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    AddReadTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    AddVerifyTask: (fn: () => Promise<boolean>) => void;
    constructor();
}
//# sourceMappingURL=Ready.d.ts.map