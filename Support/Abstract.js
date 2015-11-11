/**
 * @returns {Function}
 */
export default function Abstract(context, name, descriptor) {
    descriptor.value = function() {
        throw new ReferenceError(`Can not call an abstract method ${this.constructor.name}.${name}() ` +
            `declared in ${context.constructor.name} class.`);
    };

    return descriptor;
}
