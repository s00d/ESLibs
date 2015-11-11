import Dispatcher from "/Events/Dispatcher";

/**
 *
 */
export default class Keyboard {
    /**
     * @type {Dispatcher}
     */
    dispatcher = new Dispatcher;

    /**
     * @param {HTMLElement} dom
     * @returns {Keyboard}
     */
    constructor(dom = document) {
        var getKeyEvent = e => {
            return {
                original: e,
                code:     e.keyCode,
                char:     e.charCode,
                keyShift: e.shiftKey,
                keyAlt:   e.altKey,
                keyCtrl:  e.ctrlKey
            };
        };

        dom.addEventListener('keypress', (e) => {
            this.dispatcher.fire('press', getKeyEvent(e));
        }, false);

        dom.addEventListener('keydown', (e) => {
            this.dispatcher.fire('down', getKeyEvent(e));
        }, false);

        dom.addEventListener('keyup', (e) => {
            this.dispatcher.fire('up', getKeyEvent(e));
        }, false);
    }
    
    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    press(callback: Function) {
        return this.dispatcher.listen('press', callback);
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    down(callback: Function) {
        return this.dispatcher.listen('down', callback);
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    up(callback: Function) {
        return this.dispatcher.listen('up', callback);
    }

}
