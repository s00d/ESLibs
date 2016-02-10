export default function Constructor(ctx, name, descriptor) {
    descriptor.value.apply(ctx);
    descriptor.value = function() {
        throw new Error('Constructor already has been called.');
    };
    return descriptor;
}
