import Dispatcher from "/Events/Dispatcher";

/**
 * Event
 */
export default class EventListener {
    /**
     * @param {Array|string|string[]} events
     * @param {HTMLElement} dom
     * @returns {Dispatcher}
     */
    static create(events, dom:HTMLElement = window) {
        let listener = new Dispatcher();

        events = events instanceof Array ? events : [events];

        for (let i = 0; i < events.length; i++) {
            dom.addEventListener(events[i], event => {
                listener.fire(events[i], event);
            }, false);
        }

        return listener;
    }

    /**
     * @type {number}
     * @private
     */
    static _lastId = 0;

    /**
     * @type {boolean}
     * @private
     */
    _removed = false;

    /**
     * @type {number}
     * @private
     */
    _id = 0;

    /**
     * @type {Dispatcher}
     * @private
     */
    _dispatcher = null;

    /**
     * @type {string}
     * @private
     */
    _name = null;

    /**
     * @type {Function}
     * @private
     */
    _callback = null;

    /**
     * @type {boolean}
     * @private
     */
    _once = false;

    /**
     * @param {Dispatcher} dispatcher
     * @param {string} name
     * @param {Function} callback
     */
    constructor(dispatcher:Dispatcher, name:string, callback:Function) {
        this._id         = this.constructor._lastId++;
        this._name       = name;
        this._dispatcher = dispatcher;
        this._callback   = callback;
    }

    /**
     * @returns {number}
     */
    get id() {
        return this._id;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * @param once
     * @returns {Event}
     */
    once(once = true) {
        this._once = once;
        return this;
    }

    /**
     * @param args
     * @returns {*}
     */
    fire(...args) {
        var result = this._callback(...args);
        if (this._once) {
            this.remove();
        }
        return result;
    }

    /**
     * @returns {Dispatcher}
     */
    remove() {
        var handlers = this._dispatcher.getHandlers(this._name);

        for (var i = 0; i < handlers.length; i++) {
            if (handlers[i]._id === this._id) {
                handlers.splice(i, 1);
                break;
            }
        }

        return this._dispatcher;
    }
}
