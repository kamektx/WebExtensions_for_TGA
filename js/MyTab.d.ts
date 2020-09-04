/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class MyTab {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsNotError: boolean;
    IsActive?: boolean;
    WindowID?: number;
    TabID?: number;
    Status?: string;
    ScreenShot?: ScreenShot;
    Title?: string;
    URL?: string;
    IsHidden?: boolean;
    IsPinned?: boolean;
    SendingObject: SendingObject;
    MyWindow: MyWindow;
    Verify: () => Promise<boolean>;
    Verify_DontWaitReady: () => Promise<boolean>;
    Query: () => Promise<browser.tabs.Tab | undefined>;
    Update: () => Promise<boolean>;
    SetTabInfo: (tabInfo: browser.tabs.Tab) => Promise<boolean>;
    constructor(myWindow: MyWindow, arg: (number | browser.tabs.Tab));
}
declare class MyTabs extends Map<number, MyTab> {
    toJSON(): [number, MyTab][];
}
//# sourceMappingURL=MyTab.d.ts.map