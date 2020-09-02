"use strict";
const DirectionArray = [
    "Down",
    "Up",
    "Right",
    "Left"
];
class RowSetting {
    constructor(myType = "", maxColumns = 0) {
        this.Type = myType;
        this.MaxColumns = maxColumns;
    }
}
class ColumnSetting {
    constructor(row = new RowSetting(), size = "big") {
        this.Size = size;
        this.Row = row;
    }
}
class StartPosition {
    constructor(row = 0, column = 0) {
        this.Column = column;
        this.Row = row;
    }
}
class Arrangement {
    constructor(startPosition = new StartPosition()) {
        this.Column = new Array();
        this.StartPosition = startPosition;
    }
}
class HandleDirection {
    constructor() {
        this.Down = false;
        this.Up = false;
        this.Right = false;
        this.Left = false;
    }
}
class Arrangements {
    constructor() {
        this.HandleDirection = new HandleDirection();
    }
    AddDirection(arrangement, direction, overWrite = false) {
        if (this.HandleDirection[direction] && !overWrite) {
            return false;
        }
        this.HandleDirection[direction] = true;
        this[direction] = arrangement;
        return true;
    }
    RemoveDirecton(direction) {
        if (!this.HandleDirection[direction]) {
            return false;
        }
        this.HandleDirection[direction] = false;
        this[direction] = undefined;
        return true;
    }
}
//# sourceMappingURL=Arrangements.js.map