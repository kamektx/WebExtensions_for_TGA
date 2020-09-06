/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class SendingObject {
    Ready2: Ready;
    ActiveWindowID: number | undefined;
    Arrangements: Arrangements;
    Windows: MyWindows;
    UnmanagedWindows: Set<number>;
    Error: SendingObjectError;
    FindWindowWhichHasTheTabID: (tabID: number) => Promise<(MyWindow | undefined)>;
    HasWindowID: (windowID: number) => Promise<("false" | "managed" | "unmanaged")>;
    SetWindowsInfo: (windowsInfo: browser.windows.Window[]) => Promise<boolean>;
    Verify: () => Promise<boolean>;
    AddWindow: (windowInfo: browser.windows.Window) => Promise<boolean>;
    RemoveWindow: (windowID: number) => Promise<boolean>;
    FocusChanged: (windowID: number) => Promise<boolean>;
    constructor();
}
//# sourceMappingURL=SendingObject.d.ts.map