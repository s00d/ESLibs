import Obj from "/Support/Std/Obj";
import {toJson as JsonableKey} from "/Support/Interfaces/Jsonable";
import {toObject as SerializableKey} from "/Support/Interfaces/Serializable";


export default class Serialize {
    /**
     * @param value
     * @returns {String}
     */
    static toString(value) {
        if (typeof(value) === 'number') {
            return value.toString();
        }
        var result = this.toObject(value);
        return result ? result.toString() : '';
    }

    /**
     * @param {Object} target
     * @returns {string}
     */
    static toJson(target:Object) : string {
        if (!target[JsonableKey]) {
            return JSON.stringify(this.toObject(target));
        }
        return JSON.stringify(this._parse(target, JsonableKey));
    }

    /**
     * @param {Object} target
     * @returns {*}
     */
    static toObject(target:Object) : Object {
        return this._parse(target, SerializableKey);
    }

    /**
     * @param {Object} target
     * @param {Symbol} symbol
     * @returns {*}
     * @private
     */
    static _parse(target:Object, symbol:Symbol) {
        var result = {};

        if (typeof target === 'object' && target[symbol] instanceof Function) {
            result = Obj.map(target[symbol](), (key, value, s) => {
                if (value instanceof Object) {
                    return this._parse(value, symbol);
                } else {
                    return value;
                }
            });

        } else {

            return target;
        }

        return result;
    }
}
