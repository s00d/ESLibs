import Display from "/Support/Display";
import Abstract from "/Support/Abstract";
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
     * @returns {{show: show, hide: hide}}
     */
    call() {
        let _this = this;
        return {
            show: (...args) => {
                if (!_this._visible) {
                    _this._visible = true;
                    return _this.show(...args);
                }
            },
            hide: (...args) => {
                if (_this._visible) {
                    _this._visible = false;
                    return _this.hide(...args);
                }
            }
        };
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

    resume() {}

    pause() {}
}
