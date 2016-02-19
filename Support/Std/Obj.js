export default class Obj {
    /**
     * @param {Object} object
     * @returns {Object}
     */
    static clone(object):Object {
        if (Object.assign) {
            return Object.assign({}, object);
        }

        var output = JSON.parse(JSON.stringify(object));

        var cloneFunctions = (source, target) => {
            Object.keys(source).forEach(key => {
                if (source[key] instanceof Function) {
                    target[key] = source[key];
                }
            });
        };

        cloneFunctions(object, output);

        if (object instanceof Function) {
            cloneFunctions(object.prototype, output.prototype);
        } else {
            cloneFunctions(object.constructor, output.constructor);
        }

        return output;
    }

    /**
     * @param instances
     * @returns {{}}
     */
    static merge(...instances) {
        var output = {};

        for (var i = 0, length = instances.length; i < length; i++) {
            var source = this.clone(instances[i]);
            Object.keys(source).forEach(key => {
                output[key] = source[key];
            });
        }

        return output;
    }

    /**
     * @param object
     * @param prefix
     * @returns {{}}
     */
    static reduce(object, prefix = '') {
        var result = {};

        for (var key in object) {
            var currentPrefix = prefix ? `${prefix}.${key}` : key;

            if (typeof object[key] === 'object') {
                result = this.merge(result, this.reduce(object[key], currentPrefix));
            } else {
                result[currentPrefix] = object[key];
            }
        }

        return result;
    }


    /**
     * @param {Object} source
     * @param {Function} everyValue
     * @returns {*}
     */
    static each(source:Object, everyValue:Function) {
        return this.map(source, (k, v, s) => {
            everyValue(k, v, s);
            return v;
        });
    }

    /**
     * @param {Object} source
     * @param {Function} everyValue
     * @returns {*}
     */
    static map(source:Object, everyValue:Function) {
        var output = {};
        if (typeof source !== 'object') {
            return source;
        }


        if (source[Symbol.iterator] != null) {
            for (var key of source) {
                var value = source[key];
                if (key instanceof Array) {
                    [key, value] = key;
                }
                output[key] = everyValue(key, value, source);
            }

        } else if (source.forEach != null) {
            source.forEach((k, v) => {
                output[key] = everyValue(key, source[key], source);
            });

        } else if (source.each != null) {
            source.each((k, v) => {
                output[key] = everyValue(key, source[key], source);
            });

        } else {
            for (var key in source) {
                output[key] = everyValue(key, source[key], source);
            }
        }

        return output;
    }


    /**
     * @param key
     * @param value
     * @returns {{}}
     */
    static make(key, value) {
        var anonymous  = {};
        anonymous[key] = value;
        return anonymous;
    }

    /**
     *
     * @param object
     * @returns {Array}
     */
    static methods(object) {
        return Object.getOwnPropertyNames(object.__proto__);
    }

    /**
     * @param object
     * @returns {Array}
     */
    static properties(object) {
        return Reflect.ownKeys(object);
    }

    /**
     * @param object
     * @returns {T[]|Array[]|Array.<T>}
     */
    static getInterface(object) {
        return this.properties(object).concat(this.methods(object));
    }
}
