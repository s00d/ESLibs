import Dispatcher from "/Events/Dispatcher";

/**
 * Display
 */
export default class Display {
    /**
     * @type {Dispatcher}
     * @private
     */
    _dispatcher = new Dispatcher();

    /**
     * @constructor
     */
    constructor() {
        window.addEventListener('focus', (e =>   this._dispatcher.fire('focus', e)), false);

        window.addEventListener('blur', (e =>    this._dispatcher.fire('blur', e)), false);

        window.addEventListener('resize', (e =>  {
            this._dispatcher.fire('resize', {
                width: window.innerWidth ||
                    document.documentElement.clientWidth ||
                    document.body.clientWidth,
                height: window.innerHeight ||
                    document.documentElement.clientHeight ||
                    document.body.clientHeight
            })
        }), false);
    }

    /**
     * @param callback
     * @returns {EventObject}
     */
    focus(callback) {
        return this._dispatcher.listen('focus', callback);
    }


    /**
     * @param callback
     * @returns {EventObject}
     */
    blur(callback) {
        return this._dispatcher.listen('blur', callback);
    }

    /**
     * @param callback
     * @returns {EventObject}
     */
    resize(callback) {
        return this._dispatcher.listen('resize', callback);
    }
}
