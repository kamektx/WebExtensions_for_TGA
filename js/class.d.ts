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
declare class MyTab {
    constructor(tabID: number);
}
declare class MyTabs extends Map<number, MyTab> {
    toJSON(): string;
}
declare class MyWindow {
    Ready: Promise<void>;
    IsReady: boolean;
    IsActive: boolean;
    WindowID?: number;
    ActiveTabID?: number;
    RecentTabs: number[];
    TabsInOrder: number[];
    Tabs?: MyTabs;
    Tabs2?: MyTabs;
    constructor(windowID: number);
}
declare class MyWindows extends Map<number, MyWindow> {
    toJSON(): string;
}
declare class SendingObject {
    ActiveWindowID?: number;
    Arrangements?: Arrangements;
    Windows?: MyWindows;
}
declare class App {
    Port: browser.runtime.Port;
    SendingObject?: SendingObject;
    SendingJson?: string;
    constructor();
}
declare const app: App;
//# sourceMappingURL=class.d.ts.map