const DirectionArray = [
  "Down",
  "Up",
  "Right",
  "Left"
] as const;
type Direction = typeof DirectionArray[number];
class RowSetting {
  Type: string;
  MaxColumns: number;
  constructor(myType: string = "", maxColumns: number = 0) {
    this.Type = myType;
    this.MaxColumns = maxColumns;
  }
}
class ColumnSetting {
  Row: RowSetting;
  Size: string;
  constructor(row: RowSetting = new RowSetting(), size: string = "big") {
    this.Size = size;
    this.Row = row;
  }
}
class StartPosition {
  Row: number;
  Column: number;
  constructor(row: number = 0, column: number = 0) {
    this.Column = column;
    this.Row = row;
  }
}
class Arrangement {
  Column: ColumnSetting[];
  StartPosition: StartPosition;
  constructor(startPosition: StartPosition = new StartPosition()) {
    this.Column = new Array<ColumnSetting>();
    this.StartPosition = startPosition;
  }
}
class HandleDirection {
  Down = false;
  Up = false;
  Right = false;
  Left = false;
}
class Arrangements {
  Down?: Arrangement;
  Up?: Arrangement;
  Right?: Arrangement;
  Left?: Arrangement;
  HandleDirection: HandleDirection;
  constructor() {
    this.HandleDirection = new HandleDirection();
  }
  AddDirection(arrangement: Arrangement, direction: Direction, overWrite = false): boolean {
    if (this.HandleDirection[direction] && !overWrite) {
      return false;
    }
    this.HandleDirection[direction] = true;
    this[direction] = arrangement;
    return true;
  }
  RemoveDirecton(direction: Direction): boolean {
    if (!this.HandleDirection[direction]) {
      return false;
    }
    this.HandleDirection[direction] = false;
    this[direction] = undefined;
    return true;
  }
}