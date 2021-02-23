const DirectionArray = [
  "Down",
  "Up",
  "Right",
  "Left"
] as const;
type Direction = typeof DirectionArray[number];

class ColumnSetting {
  Type: string;
  MaxColumns: number;
  Size: string;
  constructor(myType: string = "", maxColumns: number = -1, size: string = "big") {
    this.Size = size;
    this.Type = myType;
    this.MaxColumns = maxColumns;
  }
}
class StartPosition {
  Index: number;
  Column: number;
  constructor(column: number = 0, index: number = 0) {
    this.Column = column;
    this.Index = index;
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
    this.AddDirection(new Arrangement(new StartPosition(0, 1)), "Down");
    this.Down!.Column.push(new ColumnSetting("RecentTabs", 2, "big"));
    this.Down!.Column.push(new ColumnSetting("TabsInOrder", -1, "small"));
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