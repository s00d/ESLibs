/**
 *
 * @param relations
 * @returns {Function}
 * @constructor
 */
export function Dependencies(...relations) {
    return function (cls) {
        cls.dependsOn = cls.dependsOn.concat(relations);
    };
}

/**
 *
 * @param observers
 * @returns {Function}
 * @constructor
 */
export function Observe(...observers) {
    return function (cls) {
        for (var i = 0; i < observers.length; i++) {
            cls.observe(new observers[i](cls));
        }
    }
}
