"use strict";
class Thread {
    static async Delay(milliseconds) {
        return new Promise((resolve) => {
            setTimeout(resolve, milliseconds);
        });
    }
}
//# sourceMappingURL=utilFunctions.js.map