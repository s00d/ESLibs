import Is from "/Support/Std/Is";
import Arr from "/Support/Std/Arr";
import Obj from "/Support/Std/Obj";
import Str from "/Support/Std/Str";
import Regex from "/Support/Std/Regex";

/**
 *
 */
export default class Primitive {
    /**
     * Export functions
     * @param force
     */
    static exportHelpers(force = false) {
        this.exportPrototype(force);
        this.exportStatic(force);
        this.exportIs(force);
    }

    /**
     * Export helper functions to proto
     * @param force
     */
    static exportPrototype(force = false) {

        // ==========================
        // ========= Array  =========
        // ==========================

        if (!Array.prototype.reduce || force) {
            Object.defineProperty(Array.prototype, 'reduce', {
                value: function () {
                    return Arr.reduce(this);
                }
            });
        }

        if (!Array.prototype.has || force) {
            Object.defineProperty(Array.prototype, 'has', {
                value: function (needle) {
                    return Arr.has(this, needle);
                }
            });
        }

        // ==========================
        // ========= Object =========
        // ==========================

        if (!Object.prototype.clone || force) {
            Object.defineProperty(Object.prototype, 'clone', {
                value: function () {
                    return Obj.clone(this);
                }
            });
        }

        if (!Object.prototype.merge || force) {
            Object.defineProperty(Object.prototype, 'merge', {
                value: function (...args) {
                    return Obj.merge(this, ...args);
                }
            });
        }

        if (!Object.prototype.reduce || force) {
            Object.defineProperty(Object.prototype, 'reduce', {
                value: function (prefix:string = '') {
                    return Obj.reduce(this, prefix);
                }
            });
        }

        if (!Object.prototype.each || force) {
            Object.defineProperty(Object.prototype, 'each', {
                value: function (everyValue:Function) {
                    return Obj.each(this, everyValue);
                }
            });
        }

        if (!Object.prototype.map || force) {
            Object.defineProperty(Object.prototype, 'map', {
                value: function (everyValue:Function) {
                    return Obj.map(this, everyValue);
                }
            });
        }

        if (!Object.prototype.methods || force) {
            Object.defineProperty(Object.prototype, 'methods', {
                value: function () {
                    return Obj.methods(this);
                }
            });
        }

        if (!Object.prototype.properties || force) {
            Object.defineProperty(Object.prototype, 'properties', {
                value: function () {
                    return Obj.properties(this);
                }
            });
        }

        if (!Object.prototype.getInterface || force) {
            Object.defineProperty(Object.prototype, 'getInterface', {
                value: function () {
                    return Obj.getInterface(this);
                }
            });
        }

        // ==========================
        // ========= String =========
        // ==========================

        if (!String.prototype.upperCaseFirst || force) {
            Object.defineProperty(String.prototype, 'upperCaseFirst', {
                value: function (length:number = 1) {
                    return Str.upperCaseFirst(this, length);
                }
            });
        }

        if (!String.prototype.lowerCaseFirst || force) {
            Object.defineProperty(String.prototype, 'lowerCaseFirst', {
                value: function (length:number = 1) {
                    return Str.lowerCaseFirst(this, length);
                }
            });
        }

        if (!String.prototype.studlyCase || force) {
            Object.defineProperty(String.prototype, 'studlyCase', {
                value: function () {
                    return Str.studlyCase(this);
                }
            });
        }

        if (!String.prototype.camelCase || force) {
            Object.defineProperty(String.prototype, 'camelCase', {
                value: function () {
                    return Str.camelCase(this);
                }
            });
        }

        if (!String.prototype.pluralize || force) {
            Object.defineProperty(String.prototype, 'pluralize', {
                value: function (n:number) {
                    return Str.pluralize(this, n);
                }
            });
        }

        if (!String.prototype.snakeCase || force) {
            Object.defineProperty(String.prototype, 'snakeCase', {
                value: function (delimiter:string = '_') {
                    return Str.snakeCase(this, delimiter);
                }
            });
        }

        if (!String.prototype.isLower || force) {
            Object.defineProperty(String.prototype, 'isLower', {
                value: function () {
                    return Str.isLower(this);
                }
            });
        }

        if (!String.prototype.isUpper || force) {
            Object.defineProperty(String.prototype, 'isUpper', {
                value: function () {
                    return Str.isUpper(this);
                }
            });
        }

        if (!String.prototype.startsWith || force) {
            Object.defineProperty(String.prototype, 'startsWith', {
                value: function (needles:string|Array) {
                    return Str.startsWith(this, needles);
                }
            });
        }

        if (!String.prototype.endsWith || force) {
            Object.defineProperty(String.prototype, 'endsWith', {
                value: function (needles:string|Array) {
                    return Str.endsWith(this, needles);
                }
            });
        }

        if (!String.prototype.repeat || force) {
            Object.defineProperty(String.prototype, 'repeat', {
                value: function (count:number = 1) {
                    return Str.repeat(this, count);
                }
            });
        }

        if (!String.prototype.zeroFirst || force) {
            Object.defineProperty(String.prototype, 'zeroFirst', {
                value: function (decimals:number = 2) {
                    return Str.zeroFirst(this, decimals);
                }
            });
        }


    }

    /**
     * Export static functions
     * @param force
     */
    static exportStatic(force = false) {
        // ==========================
        // ========= RegExp =========
        // ==========================

        if (!RegExp.escape || force) {
            Object.defineProperty(RegExp, 'escape', {
                value: function (text) {
                    return Regex.escape(text);
                }
            });
        }

        // ==========================
        // ========= String =========
        // ==========================

        if (!String.guid || force) {
            Object.defineProperty(String, 'guid', {
                value: function () {
                    return Str.guid();
                }
            });
        }
    }

    /**
     * @param force
     */
    static exportIs(force = false) {
        var properties = Obj.properties(Is);
        for (let i = 0; i < properties.length; i++) {
            let name = properties[i];

            if (!Object[name] || force) {
                Object.defineProperty(Object.prototype, `is${Str.upperCaseFirst(name)}`, {
                    value: function () {
                        return Is[name](this);
                    }
                });
            }
        }
    }
}
