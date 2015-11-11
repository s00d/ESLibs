/**
 * Event
 */
export default class EventObject {
    /**
     * @type {number}
     */
    static id = 0;

    /**
     * @type {boolean}
     */
    $removed = false;

    /**
     * @type {number}
     */
    $id = 0;

    /**
     * @type {Dispatcher}
     */
    $dispatcher = null;

    /**
     * @type {String}
     */
    $name = null;

    /**
     * @type {Function}
     */
    $callback = null;

    /**
     * @type {boolean}
     */
    $once = false;

    /**
     * @param {Dispatcher} dispatcher
     * @param {String} name
     * @param {Function} callback
     */
    constructor(dispatcher:Dispatcher, name:String, callback:Function) {
        this.$id         = this.constructor.id++;
        this.$name       = name;
        this.$dispatcher = dispatcher;
        this.$callback   = callback;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this.$id;
    }

    /**
     * @returns {String}
     */
    get name() {
        return this.$name;
    }

    /**
     * @param once
     * @returns {Event}
     */
    once(once = true) {
        this.$once = once;
        return this;
    }

    /**
     * @param args
     * @returns {*}
     */
    fire(...args) {
        var result = this.$callback(...args);
        if (this.$once) {
            this.remove();
        }
        return result;
    }

    /**
     * @returns {Dispatcher}
     */
    remove() {
        var handlers = this.$dispatcher.getHandlers(this.$name);

        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i].$id === this.$id) {
                handlers.splice(i, 1);
                break;
            }
        }

        return this.$dispatcher;
    }
}
