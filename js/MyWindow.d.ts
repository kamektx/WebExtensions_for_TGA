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
    Verify: () => Promise<boolean>;
    Verify_DontWaitReady: () => Promise<boolean>;
    ActiveTabChanged: (tabID: number) => Promise<boolean>;
    CreateTab: (tabInfo: browser.tabs.Tab) => Promise<boolean>;
    SetWindowInfo: (windowInfo: browser.windows.Window) => Promise<boolean>;
    SetTabInfo: (tabInfo: browser.tabs.Tab) => void;
    InsertTabInfo: (tabInfo: browser.tabs.Tab) => void;
    constructor(arg: (number | browser.windows.Window));
}
declare class MyWindows extends Map<number, MyWindow> {
    toJSON(): [number, MyWindow][];
}
//# sourceMappingURL=MyWindow.d.ts.map