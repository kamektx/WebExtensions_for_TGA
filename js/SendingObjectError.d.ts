declare class SendingObjectError {
    static readonly WaitForErrorHandle = 200;
    static readonly TimerTickTime = 30;
    SendingObject: SendingObject;
    IsError: boolean;
    TimerMilliSeconds: number;
    Timer: () => Promise<boolean>;
    HandleError: () => Promise<boolean>;
    ThrowError(errString: string): void;
    constructor(sendingObject: SendingObject);
}
//# sourceMappingURL=SendingObjectError.d.ts.map