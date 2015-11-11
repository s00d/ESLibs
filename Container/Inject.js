/**
 * @type {Symbol}
 */
export const INJECT = Symbol('$inject');

/**
 * @param aliases
 * @returns {Function}
 * @constructor
 */
export default function Inject(...aliases) {
    return (context, name, descriptor) => {
        if (!context[INJECT]) {
            context[INJECT] = {};
        }

        context[INJECT][name ? name : 'class'] = aliases;

        return descriptor;
    }
}
