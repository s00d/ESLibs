import {default as FiredEvent} from "/Events/Event";
import {default as Listener} from "/Events/EventListener";

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
     * @returns {Listener}
     */
    listen(name:String, callback:Function) {
        var event = new Listener(this, name, callback);
        this._getHandlers(name).push(event);

        return event;
    }

    /**
     * @param name
     * @param callback
     * @returns {Listener}
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
        this._getHandlers(name);

        var handlers = this._getCompatibleEvents(name);
        var result   = args;

        for (var i = 0; i < handlers.length; i++) {
            let event = args.length === 1 && args[0] instanceof FiredEvent
                ? args[0]
                : new FiredEvent(name, args);

            handlers[i].fire(event);
        }

        return result.length === 1 ? result[0] : result;
    }

    /**
     * @param {string} name
     * @returns {Array}
     * @private
     */
    _getHandlers(name:string):Array {
        if (!this.events[name]) {
            this.events[name] = [];
        }

        return this.events[name];
    }

    /**
     * @param name
     * @returns {Array}
     * @private
     */
    _getCompatibleEvents(name) {
        var compatible = [];

        Object.keys(this.events).forEach(event => {
            var regexp = Dispatcher._createHandlerNameRegexp(event);
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
    static _createHandlerNameRegexp(name) {
        name = name
            .replace(/[\-\[\]\/\{\}\(\)\+\?\.\\\^\$\|]/g, "\\$&")
            .replace('*', '(.*?)');
        return new RegExp(`^${name}$`, 'gi');
    }
}
