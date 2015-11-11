import Abstract from "/Support/Abstract";
import Dispatcher from "/Events/Dispatcher";

/**
 * Base controller class
 */
export default class BaseController {
    /**
     * Controller visibility
     */
    visible = false;

    /**
     * Controller events
     * @type {Dispatcher}
     */
    events = new Dispatcher();

    /**
     * Show controller
     * @returns {BaseController}
     */
    show() {
        this.visible = true;
        this.events.fire('show', this);
        return this;
    }

    /**
     * Hide controller
     * @returns {BaseController}
     */
    hide() {
        this.events.fire('hide', this);
        this.visible = false;
        return this;
    }

    /**
     * @param callback
     * @returns {BaseController}
     */
    onShow(callback) {
        this.events.listen('show', callback);
        return this;
    }

    /**
     * @param callback
     * @returns {BaseController}
     */
    onHide(callback) {
        this.events.listen('hide', callback);
        return this;
    }

    /**
     * Controller destructor
     */
    @Abstract destructor() {}
}
