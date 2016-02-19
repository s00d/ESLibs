import Abstract from "/Support/Access/Abstract";

/**
 * Abstract timer
 */
export default class AbstractTimer {
    /**
     * @type {Function}
     * @private
     */
    _callback = (() => null);

    /**
     * @param {Function} callback
     */
    constructor(callback:Function) {
        this._callback = callback;
    }

    /**
     * @returns {Function}
     */
    get callback() {
        return this._callback;
    }

    @Abstract tick() {}

    @Abstract wantsDispose() {}
}
