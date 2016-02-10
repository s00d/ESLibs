import Dispatcher from "/Events/Dispatcher";

/**
 * Event listener
 */
export default class EventListener {
    /**
     * @param dom
     * @param eventNames
     * @returns {EventListener}
     */
    static create(eventNames, dom:HTMLElement = window) {
        return new this(eventNames, dom);
    }

    /**
     * @type {Dispatcher}
     * @private
     */
    _dispatcher = new Dispatcher;

    /**
     * @param dom
     * @param eventNames
     */
    constructor(eventNames, dom:HTMLElement = window) {
        if (!(eventNames instanceof Array)) {
            eventNames = [eventNames];
        }

        for (var i = 0; i < eventNames.length; i++) {
            dom.addEventListener(eventNames[i], (event) => {
                this._dispatcher.fire('event', event);
            }, false);
        }
    }

    /**
     * @param callable
     * @returns {EventObject}
     */
    subscribe(callable:Function) {
        return this._dispatcher.listen('event', callable);
    }

    /**
     * @returns {EventListener}
     */
    dispose() {
        this._dispatcher.dispose();
        return this;
    }
}
