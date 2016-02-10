export default class Obj {
    /**
     * @param object
     * @returns {*}
     */
    static clone(object) {
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
}