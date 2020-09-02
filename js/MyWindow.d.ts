/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class MyWindow {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsActive: boolean;
    WindowID?: number;
    ActiveTabID?: number;
    RecentTabs: number[];
    TabsInOrder: number[];
    SendingObject: SendingObject;
    Tabs: MyTabs;
    Tabs2: MyTabs;
    Verify: () => Promise<boolean>;
    ActiveTabChanged: (tabID: number) => Promise<boolean>;
    SetWindowInfo: (windowInfo: browser.windows.Window) => Promise<boolean>;
    constructor(arg: (number | browser.windows.Window));
}
declare class MyWindows extends Map<number, MyWindow> {
    toJSON(): [number, MyWindow][];
}
//# sourceMappingURL=MyWindow.d.ts.map