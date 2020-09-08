declare class Ready {
    static readonly MaxTasks = 1000;
    private _IsReady;
    private _Tasks;
    private _VerifyTasks;
    private _TaskIndex;
    private _DoneTaskIndex;
    private _LastWriteTaskIndex;
    private _WriteAccess;
    private _IsNotyfyChange;
    IsNotError: boolean;
    SendingObject: SendingObject;
    get IsReady(): boolean;
    get IsError(): boolean;
    Verify: () => Promise<void>;
    AddWriteTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    AddReadTask: (fn: () => Promise<boolean>, ifReturnFalse?: ("error" | "ignore"), ifAlreadyError?: ("quit" | "force")) => Promise<boolean>;
    WaitForThisReadyAndWaitForSendingJSON: () => Promise<boolean>;
    AddReadTaskAny: <T>(fn: () => Promise<T>, ifAlreadyError?: ("quit" | "force")) => Promise<T | undefined>;
    AddVerifyTask: (fn: () => Promise<boolean>, position?: ("first" | "last")) => void;
    NotifyChange: () => boolean;
    constructor(sendingObject: SendingObject, isNotifyChange?: boolean);
}
//# sourceMappingURL=Ready.d.ts.map