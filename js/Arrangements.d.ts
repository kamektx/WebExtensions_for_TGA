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
//# sourceMappingURL=Arrangements.d.ts.map