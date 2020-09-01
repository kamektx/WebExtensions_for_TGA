/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare const DirectionArray: readonly ["Down", "Up", "Right", "Left"];
declare type Direction = typeof DirectionArray[number];
declare class RowSetting {
    Type: string;
    MaxColumns: number;
    constructor(myType?: string, maxColumns?: number);
}
declare class ColumnSetting {
    Row: RowSetting;
    Size: string;
    constructor(row?: RowSetting, size?: string);
}
declare class StartPosition {
    Row: number;
    Column: number;
    constructor(row?: number, column?: number);
}
declare class Arrangement {
    Column: ColumnSetting[];
    StartPosition: StartPosition;
    constructor(startPosition?: StartPosition);
}
declare class HandleDirection {
    Down: boolean;
    Up: boolean;
    Right: boolean;
    Left: boolean;
}
declare class Arrangements {
    Down?: Arrangement;
    Up?: Arrangement;
    Right?: Arrangement;
    Left?: Arrangement;
    HandleDirection: HandleDirection;
    constructor();
    AddDirection(arrangement: Arrangement, direction: Direction, overWrite?: boolean): boolean;
    RemoveDirecton(direction: Direction): boolean;
}
declare class ScreenShot {
    ID?: string;
    Format?: ("jpeg" | "png");
    Data?: string;
    TabID?: number;
    URL?: string;
    toJSON(): string;
}
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
    IsPinned?: boolean;
    SetTabInfo: (tabInfo: browser.tabs.Tab) => Promise<boolean>;
    constructor(arg: (number | browser.tabs.Tab));
}
declare class MyTabs extends Map<number, MyTab> {
    toJSON(): [number, MyTab][];
}
declare class MyWindow {
    Ready: Promise<boolean>;
    IsReady: boolean;
    IsActive: boolean;
    WindowID?: number;
    ActiveTabID?: number;
    RecentTabs: number[];
    TabsInOrder: number[];
    Tabs: MyTabs;
    Tabs2: MyTabs;
    SetWindowInfo: (windowInfo: browser.windows.Window) => Promise<boolean>;
    constructor(arg: (number | browser.windows.Window));
}
declare class MyWindows extends Map<number, MyWindow> {
    toJSON(): [number, MyWindow][];
}
declare class SendingObject {
    Ready: Promise<boolean>;
    IsReady: boolean;
    ActiveWindowID: number;
    Arrangements: Arrangements;
    Windows: MyWindows;
    SetWindowsInfo: (windowsInfo: browser.windows.Window[]) => Promise<boolean>;
    AddWindow: (windowInfo: browser.windows.Window) => Promise<boolean>;
    RemoveWindow: (windowID: number) => Promise<boolean>;
    FocusChanged: (windowID: number) => Promise<boolean>;
    constructor();
}
declare class App {
    Port: browser.runtime.Port;
    SendingObject?: SendingObject;
    SendingJson?: string;
    constructor();
}
//# sourceMappingURL=class.d.ts.map