import {INJECT} from "/Container/Inject";

/**
 * Ioc
 */
export default class Container {
    /**
     * @type {{}}
     */
    bindings = {};

    /**
     * @type {{}}
     */
    resolved = {};

    /**
     * @param {String} alias
     * @param {Function|Object} target
     * @returns {Container}
     */
    bind(alias: String, target: Function) {
        this.bindings[alias] = target;
        return this;
    }

    /**
     * @param alias
     * @param callback
     * @returns {Container}
     */
    singleton(alias: String, callback: Function) {
        this.bindings[alias] = callback(this);
        return this;
    }

    /**
     * @param {String} alias
     * @param args
     * @returns {*}
     */
    make(alias: String, ...args) {
        if (!this.resolved[alias]) {
            var target = this.bindings[alias];
            this.resolved[alias] = target instanceof Function
                ? this.resolve(target, ...args)
                : target;
        }

        return this.resolved[alias];
    }

    /**
     * @param {Function} cls
     * @param args
     */
    resolve(cls: Function, ...args) {
        /**
         * @param target
         * @param args
         * @returns {Array}
         */
        var getArguments = (target, args = []) => {
            var result = [];
            if (target && target instanceof Array) {
                for (var i = 0; i < target.length; i++) {
                    var alias = target[i];
                    result.push(this.make(alias));
                }
            }
            return result.concat(args);
        };

        /**
         * @param target
         * @param key
         */
        var decorateMethod = (target, key) => {
            ((original, key) => {
                target[key] = (...args) => {
                    args = getArguments(target[INJECT][key], args);
                    return original.apply(target, args);
                };
            })(target[key], key);
        };


        if (cls[INJECT]) {
            args = getArguments(cls[INJECT]['class'], args);

            for (var key in cls[INJECT]) {
                if (key !== 'class') {
                    decorateMethod(cls, key);
                }
            }
        }

        var instance =  args.length > 0
            ? new cls(...args)
            : new cls;

        if (instance[INJECT]) {
            for (var key in instance[INJECT]) {
                decorateMethod(instance, key);
            }
        }

        return instance;
    }
}
