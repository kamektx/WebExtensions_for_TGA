declare const DirectionArray: readonly ["Down", "Up", "Right", "Left"];
declare type Direction = typeof DirectionArray[number];
declare class ColumnSetting {
    Type: string;
    MaxColumns: number;
    Size: string;
    constructor(myType?: string, maxColumns?: number, size?: string);
}
declare class StartPosition {
    Index: number;
    Column: number;
    constructor(column?: number, index?: number);
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