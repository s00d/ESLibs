export const VIEW = Symbol('$view');

/**
 * @constructor
 */
export default function View(...aliases) {
    return (context, name, descriptor) => {
        if (!context[VIEW]) {
            context[VIEW] = [];
        }

        for (var i = 0; i < aliases.length; i++) {
            context[VIEW].push(aliases[i]);
        }

        return descriptor;
    }
}
