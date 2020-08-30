"use strict";
function enumerable(value) {
    return function (target, propertyKey, descriptor) {
        descriptor.enumerable = value;
    };
}
//# sourceMappingURL=decorator.js.map