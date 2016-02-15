import Display from "/Support/Display";
import Abstract from "/Support/Access/Abstract";
import Dispatcher from "/Events/Dispatcher";
import Container from "/Container/Container";

/**
 * BaseVM
 */
export default class BaseViewModel
{
    /**
     * @type {boolean}
     * @private
     */
    _visible = false;

    /**
     * @returns {BaseViewModel}
     */
    constructor() {
        var display = this.app.make('display');

        display.resize(({width: width, height: height}) => this.resize(width, height));
        display.blur(e => this.pause());
        display.focus(e => this.resume());
    }

    /**
     * @param args
     */
    @Abstract show(...args) {}

    /**
     * @param args
     */
    @Abstract hide(...args) {}

    /**
     * @param width
     * @param height
     */
    resize(width, height) {}

    /**
     *
     */
    resume() {}

    /**
     *
     */
    pause() {}
}
