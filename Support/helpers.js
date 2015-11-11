/**
 * Bind context
 *
 * @param fn
 * @param target
 * @returns {Function}
 */
export function bind(fn, target) {
    return function () {
        return fn.apply(target, arguments);
    };
}
