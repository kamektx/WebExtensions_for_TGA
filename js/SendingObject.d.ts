/// <reference types="./node_modules/@types/firefox-webext-browser" />
interface ReadyInstance {
    Ready: Promise<boolean>;
}
declare class SendingObject {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsNotError: boolean;
    ActiveWindowID: number | undefined;
    Arrangements: Arrangements;
    Windows: MyWindows;
    UnmanagedWindows: Set<number>;
    Error: SendingObjectError;
    ReadyInstances: Set<ReadyInstance>;
    AllReadyResolved: () => Promise<boolean>;
    FindWindowWhichHasTheTabID: (tabID: number) => Promise<(MyWindow | undefined)>;
    HasWindowID: (windowID: number) => Promise<("false" | "managed" | "unmanaged")>;
    SetWindowsInfo: (windowsInfo: browser.windows.Window[]) => Promise<boolean>;
    Verify: () => Promise<boolean>;
    Verify_DontWaitReady: () => Promise<boolean>;
    AddWindow: (windowInfo: browser.windows.Window) => Promise<boolean>;
    RemoveWindow: (windowID: number) => Promise<boolean>;
    FocusChanged: (windowID: number) => Promise<boolean>;
    constructor();
}
//# sourceMappingURL=SendingObject.d.ts.map