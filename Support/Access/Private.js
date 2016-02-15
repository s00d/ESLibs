/**
 * @returns {Function}
 */
export default function Private(context, name, descriptor) {
    descriptor.value = function() {
        throw new ReferenceError(`${name} is protected`);
    };

    return descriptor;
}
