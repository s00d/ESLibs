export default class Context {
    /**
     * @param {Function} fn
     * @param {Object} target
     * @returns {Function}
     */
    static bind(fn:Function, target:Object) : Function {
        return function () {
            return fn.apply(target, arguments);
        };
    }
}
