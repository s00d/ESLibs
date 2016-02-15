import Obj from "/Support/Std/Obj";

export const Serialized = Symbol('serialized');

export default class Serialize {
    /**
     * @param value
     * @returns {String}
     */
    static toString(value) {
        if (typeof(value) === 'number') {
            return value.toString();
        }
        var result = this.serialize(value);
        return result ? result.toString() : '';
    }

    /**
     * @param value
     * @returns {String}
     */
    static toJson(value) {
        return JSON.stringify(
            this.serialize(value)
        );
    }

    /**
     * @param target
     * @returns {*}
     */
    static serialize(target:Object) {
        var result = {};

        if (typeof target === 'object' && target[Serialized] instanceof Function) {
            result = Obj.map(target[Serialized](), (key, value, s) => {
                if (value instanceof Object) {
                    return this.serialize(value);
                } else {
                    return value;
                }
            })
        } else {
            return target;
        }

        return result;
    }
}
