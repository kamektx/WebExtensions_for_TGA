/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class MyWindow {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsNotError: boolean;
    IsActive: boolean;
    WindowID?: number;
    ActiveTabID?: number;
    RecentTabs: number[];
    TabsInOrder: number[];
    SendingObject: SendingObject;
    Tabs: MyTabs;
    Tabs2: MyTabs;
    Verify: (sizeCheck?: boolean) => Promise<boolean>;
    Verify_DontWaitReady: (sizeCheck?: boolean) => Promise<boolean>;
    ActiveTabChanged: (tabID: number) => Promise<boolean>;
    CreateTab: (tabInfo: browser.tabs.Tab) => Promise<boolean>;
    RemoveTab: (tabID: number) => Promise<boolean>;
    AttachTab: (tabID: number) => Promise<boolean>;
    DetachTab: (tabID: number) => Promise<boolean>;
    MoveTab: () => Promise<boolean>;
    ReplaceTab: (addedTabID: number, removedTabID: number) => Promise<boolean>;
    UpdateTab: (tabID: number) => Promise<boolean>;
    SetWindowInfo: (windowInfo: browser.windows.Window) => Promise<boolean>;
    SetTabInfo: (tabInfo: browser.tabs.Tab) => void;
    InsertTabInfo: (tabInfo: browser.tabs.Tab) => void;
    RemoveTabID: (tabID: number) => void;
    constructor(arg: (number | browser.windows.Window));
}
declare class MyWindows extends Map<number, MyWindow> {
    toJSON(): [number, MyWindow][];
}
//# sourceMappingURL=MyWindow.d.ts.map