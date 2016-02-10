import Dispatcher from "/Events/Dispatcher";
import EventListener from "/Events/EventListener";

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
        EventListener
            .create('focus')
            .subscribe(e => this._dispatcher.fire('focus', e));

        EventListener
            .create('blur')
            .subscribe(e => this._dispatcher.fire('blur', e));

        EventListener
            .create(['DOMContentLoaded', 'load', 'resize'])
            .subscribe(e => {
                this._dispatcher.fire('resize', {
                    width:  window.innerWidth ||
                            document.documentElement.clientWidth ||
                            document.body.clientWidth,
                    height: window.innerHeight ||
                            document.documentElement.clientHeight ||
                            document.body.clientHeight
                })
            });


        EventListener
            .create(['DOMContentLoaded', 'load', 'resize', 'scroll'])
            .subscribe(event => {
                this._dispatcher.fire('scroll', event);
            });
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    scroll(callback:Function) {
        return this._dispatcher.listen('scroll', callback);
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    focus(callback:Function) {
        return this._dispatcher.listen('focus', callback);
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    blur(callback:Function) {
        return this._dispatcher.listen('blur', callback);
    }

    /**
     * @param {Function} callback
     * @returns {EventObject}
     */
    resize(callback:Function) {
        return this._dispatcher.listen('resize', callback);
    }

    /**
     * @param {HTMLElement} element
     * @param {Function} callback
     * @returns {Dispatcher}
     */
    containsFull(element:HTMLElement, callback:Function) {
        let dispatcher = new Dispatcher();

        dispatcher.listen('event', callback);

        this.scroll(event => {
            //special bonus for those using jQuery
            if (typeof jQuery !== 'undefined' && el instanceof jQuery) el = el[0];
            var rect         = el.getBoundingClientRect();
            var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            var windowWidth  = (window.innerWidth || document.documentElement.clientWidth);

            var contains = (
                (rect.left >= 0)
                && (rect.top >= 0)
                && ((rect.left + rect.width) <= windowWidth)
                && ((rect.top + rect.height) <= windowHeight)
            );

            if (contains) {
                dispatcher.fire('event');
            }
        });

        return dispatcher;
    }

    /**
     * @param {HTMLElement} element
     * @param {Function} callback
     * @returns {Dispatcher}
     */
    containsPartially(element:HTMLElement, callback:Function) {
        let dispatcher = new Dispatcher();

        dispatcher.listen('event', callback);

        this.scroll(event => {
            //special bonus for those using jQuery
            if (typeof jQuery !== 'undefined' && el instanceof jQuery) el = el[0];
            var rect         = el.getBoundingClientRect();
            // DOMRect { x: 8, y: 8, width: 100, height: 100, top: 8, right: 108, bottom: 108, left: 8 }
            var windowHeight = (window.innerHeight || document.documentElement.clientHeight);
            var windowWidth  = (window.innerWidth || document.documentElement.clientWidth);

            // http://stackoverflow.com/questions/325933/determine-whether-two-date-ranges-overlap
            var verticalInView   = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
            var horizontalInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);

            if (verticalInView && horizontalInView) {
                dispatcher.fire('event');
            }
        });

        return dispatcher;
    }

    /**
     * @param padding
     * @returns {boolean}
     */
    static isScrollEnd(padding = 5) {
        var visible = window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight ||
            0;

        var bottom = (document.body.getBoundingClientRect().bottom - padding);

        return bottom < visible;
    }

    /**
     * @param element
     * @param {Function} callback
     * @returns {Display}
     */
    static fullScreenChange(element:HTMLElement, callback:Function) {
        return EventListener
            .create(
                ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange', 'MSFullscreenChange'],
                element
            )
            .subscribe(e => {
                callback(e);
            });
    }

    /**
     * @param element
     * @returns {Display}
     */
    static fullScreen(element:HTMLElement) {
        var requests = [
            'requestFullscreen',
            'webkitRequestFullscreen',
            'webkitRequestFullScreen',
            'mozRequestFullScreen',
            'msRequestFullscreen'
        ];

        for (var i = 0; i < requests.length; i++) {
            if (element[requests[i]]) {
                element[requests[i]](element.ALLOW_KEYBOARD_INPUT);
                return this;
            }
        }

        return this;
    }
}
