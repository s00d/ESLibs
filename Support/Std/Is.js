export default class Is {
    /**
     * @param target
     * @returns {boolean}
     */
    static array(target):boolean {
        return target instanceof Array;
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static string(target):boolean {
        return typeof target === 'string';
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static number(target):boolean {
        return typeof target === 'number';
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static regex(target):boolean {
        return target instanceof RegExp;
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static bool(target):boolean {
        return typeof target === 'boolean';
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static object(target):boolean {
        return typeof target === 'object';
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static entity(target):boolean {
        return this.defined(target) && !(target instanceof Array);
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static symbol(target):boolean {
        return typeof target === 'symbol' || // Native
            (target instanceof Function && target.name === 'Symbol'); // Polyfill
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static func(target):boolean {
        return target instanceof Function;
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static null(target):boolean {
        return target === null;
    }

    /**
     * @param target
     * @returns {boolean}
     */
    static defined(target):boolean {
        return typeof target !== 'undefined' && target != null;
    }
}
