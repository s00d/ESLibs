import Dispatcher from "/Events/Dispatcher";

/**
 * Screen
 */
export default class Screen {
    /**
     * @type {Dispatcher}
     * @private
     */
    _events = new Dispatcher;

    /**
     * @type {boolean}
     * @private
     */
    _isScrollEnd = false;

    /**
     * @constructor
     */
    constructor() {
        window.addEventListener('scroll', event => {
            this._events.fire('scroll', event);

            if (this.isScrollEnd(5)) {
                if (!this._isScrollEnd) {
                    this._events.fire('scroll:end', event);
                    this._isScrollEnd = true;
                }
                this._events.fire('scroll:down', event);
            } else {
                this._isScrollEnd = false;
            }
        }, false);
    }

    /**
     * @param event
     * @param callable
     * @returns {EventObject}
     */
    on(event:String, callable:Function) {
        return this._events.listen(event, callable);
    }

    /**
     * @param callable
     * @returns {EventObject}
     */
    onScrollEnd(callable:Function) {
        return this.on('scroll:end', callable);
    }

    /**
     * @param callable
     * @returns {EventObject}
     */
    onScrollDown(callable:Function) {
        return this.on('scroll:down', callable);
    }

    /**
     * @param padding
     * @returns {boolean}
     */
    isScrollEnd(padding = 5) {
        var visible = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
        var bottom  = document.body.getBoundingClientRect().bottom - padding;

        return bottom < visible;
    }
}
