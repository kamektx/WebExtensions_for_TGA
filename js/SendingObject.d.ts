/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class SendingObject {
    Ready2: Ready;
    readonly Type = "SendingObject";
    ActiveWindowID: number | undefined;
    Arrangements: Arrangements;
    Windows: MyWindows;
    UnmanagedWindows: Set<number>;
    ReadyInstances: ReadyInstances;
    Error: SendingObjectError;
    FindWindowWhichHasTheTabID: (tabID: number) => Promise<(MyWindow | undefined)>;
    HasWindowID: (windowID: number) => Promise<("false" | "managed" | "unmanaged")>;
    SetWindowsInfo: (windowsInfo: browser.windows.Window[]) => Promise<boolean>;
    Verify: () => Promise<boolean>;
    AddWindow: (windowInfo: browser.windows.Window) => Promise<boolean>;
    RemoveWindow: (windowID: number) => Promise<boolean>;
    FocusChanged: (windowID: number) => Promise<boolean>;
    ChangeOccured: () => Promise<void>;
    constructor();
}
//# sourceMappingURL=SendingObject.d.ts.map