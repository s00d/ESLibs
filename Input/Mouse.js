import Dispatcher from "/Events/Dispatcher";

/**
 * Mouse
 */
export default class Mouse {
    /**
     * @type {Dispatcher}
     */
    dispatcher = new Dispatcher;

    /**
     * @type {number}
     */
    x = 0;

    /**
     * @type {number}
     */
    y = 0;

    /**
     * @param node
     */
    constructor(node = document.body) {
        node.addEventListener('mousemove', (event:Event) => {
            var rect = node.getBoundingClientRect();

            this.x = event.pageX - rect.left;
            this.y = event.pageY - rect.top;

            this.dispatcher.fire('move', this);
        }, false);
    }

    /**
     * @param callback
     * @returns {Mouse}
     */
    move(callback:Function) {
        this.dispatcher.listen('move', callback);
        return this;
    }
}
