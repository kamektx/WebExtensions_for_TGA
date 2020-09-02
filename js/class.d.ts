/// <reference types="./node_modules/@types/firefox-webext-browser" />
declare class ScreenShot {
    ID?: string;
    Format?: ("jpeg" | "png");
    Data?: string;
    TabID?: number;
    URL?: string;
    toJSON(): string;
}
declare class App {
    Port: browser.runtime.Port;
    SendingObject: SendingObject;
    SendingJson?: string;
    ErrorLog: string[];
    constructor();
}
//# sourceMappingURL=class.d.ts.map