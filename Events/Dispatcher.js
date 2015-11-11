import EventObject from "/Events/EventObject";

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
     * @param name
     * @param args
     * @returns {Array}
     */
    fire(name:String, ...args) {
        var handlers    = this.getHandlers(name);
        var optionsArgs = args;

        for (var i = 0; i < handlers.length; i++) {
            var eventResponse = handlers[i].fire(...optionsArgs);
            if (typeof eventResponse !== 'undefined') {
                optionsArgs = eventResponse;
            }
        }

        return optionsArgs.length === 1
            ? optionsArgs[0]
            : optionsArgs;
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
}
