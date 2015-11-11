import Serialize from "/Support/Serialize";

/**
 * @returns {Function}
 */
export default function Abstract(context, name, descriptor) {
    var declarationName = Serialize.objectToString(context) + '.' + name;

    descriptor.value = function() {
        throw new ReferenceError('Can not call an abstract method ' + declarationName);
    };

    return descriptor;
}
