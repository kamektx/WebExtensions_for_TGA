declare class ScreenShot {
    static readonly Quality = 80;
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsNotError: boolean;
    IsCaputured: boolean;
    ID?: string;
    Format: ("jpeg" | "png");
    Data?: string;
    TabID?: number;
    TabURL?: string;
    TabStatus?: string;
    TabTitle?: string;
    ActiveWindowMilliSeconds: number;
    FirstTimeMilliSeconds: number;
    InactiveWindowMilliSeconds: number;
    IsFirstTime: boolean;
    SendingObject: SendingObject;
    MyTab: MyTab;
    CreateID(): void;
    EncodeBase32(randomArray: Uint32Array): string;
    Capture: () => Promise<boolean>;
    Recapture: () => Promise<boolean>;
    SetTabInformation: () => Promise<boolean>;
    toJSON(): string;
    ResetTimer(): void;
    constructor(myTab: MyTab);
}
//# sourceMappingURL=ScreenShot.d.ts.map