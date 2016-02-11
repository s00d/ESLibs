import Str from "/Support/Str";
import EventObject from "/Events/EventObject";

/**
 * Fired event
 */
class FiredEvent {
    /**
     * @type {string}
     * @private
     */
    _name = '';

    /**
     * @type {string}
     * @private
     */
    _originalName = '';

    /**
     * @type {Array}
     * @private
     */
    _args = [];

    /**
     * @param {string} name
     * @param {Array} args
     */
    constructor(name, ...args) {
        this._originalName = name;
        this._name = Str.studlyCase(name);
        this._args = args;
    }

    /**
     * @returns {string}
     */
    get name() : string {
        return this._name;
    }

    /**
     * @returns {*}
     */
    get args() : Array {
        return this._args;
    }

    /**
     * @returns {string}
     */
    [Symbol.toPrimitive] () {
        return 'Event ' + this.name;
    }
}

/**
 * Event Dispatcher
 */
export default class Dispatcher {
    /**
     * @constructor
     */
    constructor() {
        this.events = {};
    }

    /**
     * @param name
     * @param callback
     * @returns {EventObject}
     */
    listen(name:String, callback:Function) {
        var event = new EventObject(this, name, callback);
        this.getHandlers(name).push(event);

        return event;
    }

    /**
     * @param name
     * @param callback
     * @returns {Event}
     */
    once(name:String, callback:Function) {
        return this.listen(name, callback).once();
    }

    /**
     * @returns {Dispatcher}
     */
    dispose() {
        for (var i = 0; i < this.events.length; i++) {
            this.events[i].remove();
        }
        this.events = [];
        return this;
    }

    /**
     * @param name
     * @param args
     * @returns {boolean}
     */
    fire(name:String, ...args) {
        this.getHandlers(name);

        var handlers = this.getCompatibleEvents(name);
        var result   = args;

        for (var i = 0; i < handlers.length; i++) {
            var eventResult = handlers[i].fire(...(result.concat([name])));
            if (eventResult === false) {
                return false;
            } else if (typeof eventResult !== 'undefined') {
                result = eventResult;
            }
        }

        return result.length === 1 ? result[0] : result;
    }

    /**
     * @param name
     * @returns {*}
     */
    getHandlers(name) {
        if (!this.events[name]) {
            this.events[name] = [];
        }

        return this.events[name];
    }

    /**
     * @param name
     * @returns {Array}
     */
    getCompatibleEvents(name) {
        var compatible = [];

        Object.keys(this.events).forEach(event => {
            var regexp = Dispatcher.createHandlerNameRegexp(event);
            if (name.match(regexp)) {
                compatible = compatible.concat(this.events[event]);
            }
        });

        return compatible;
    }

    /**
     * @param name
     * @returns {RegExp}
     */
    static createHandlerNameRegexp(name) {
        name = name
            .replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&")
            .replace('*', '(.*?)');
        return new RegExp(`^${name}$`, 'gi');
    }
}
