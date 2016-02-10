export default class Arr {
    /**
     * @param target
     * @returns {Array}
     */
    static reduce(target) {
        var result = [];

        if (target instanceof Array) {
            for (var i = 0; i < target.length; i++) {
                if (typeof target[i] === 'object') {
                    result = result.concat(this.reduce(target[i]));
                } else {
                    result.push(target[i]);
                }
            }

        } else if (typeof target === 'object') {
            for (var key in target) {
                if (typeof target[key] === 'object') {
                    result = result.concat(this.reduce(target[key]));
                } else {
                    result.push(target[key]);
                }
            }

        } else {

            result.push(target);
        }

        return result;
    }

    /**
     *
     * @param haystack
     * @param needle
     * @returns {boolean}
     */
    static has(haystack, needle) {
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param item
     * @returns {Array}
     */
    static make(item) {
        return item instanceof Array ? item : [item];
    }
}
