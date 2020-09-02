/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class MyTab {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsActive?: boolean;
    WindowID?: number;
    TabID?: number;
    Index?: number;
    ScreenShot?: ScreenShot;
    Title?: string;
    URL?: string;
    IsHidden?: boolean;
    IsPinned?: boolean;
    SendingObject: SendingObject;
    MyWindow: MyWindow;
    SetTabInfo: (tabInfo: browser.tabs.Tab) => Promise<boolean>;
    constructor(myWindow: MyWindow, arg: (number | browser.tabs.Tab));
}
declare class MyTabs extends Map<number, MyTab> {
    toJSON(): [number, MyTab][];
}
//# sourceMappingURL=MyTab.d.ts.map