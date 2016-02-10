/**
 * Thread
 */
export default class Thread {
    /**
     * @type {null|Number}
     * @private
     */
    _timer = null;

    /**
     * @type {Function}
     * @private
     */
    _callback = (() => null);

    /**
     * @type {number}
     * @private
     */
    _await = 1;

    /**
     * @type {Function}
     * @private
     */
    _after = (() => null);

    /**
     * @param {Function} callback
     * @param {Number} await
     */
    constructor(callback:Function, await = 1) {
        this._callback = callback;
        this._await = await;
    }

    /**
     * @param {Number} time
     * @returns {Thread}
     */
    await(time:Number) {
        this._await = (time < 1 ? 1 : time);
        return this;
    }

    /**
     * @returns {Thread}
     */
    run() {
        this._timer = setTimeout(() => {
            var result = this._callback(this);
            if (result instanceof Promise) {
                result.then(e => this._after(this));
            } else {
                this._after(this);
            }

        }, this._await);
        return this;
    }

    /**
     * @returns {Thread}
     * @throws Error
     */
    reject() {
        if (!this._timer) {
            throw new Error('Can not reject thread. No thread id found.');
        }
        clearTimeout(this._timer);
        this._timer = null;

        return this;
    }


    /**
     * @param callback
     * @returns {Thread}
     */
    then(callback) {
        let thread = new Thread(callback);
        this._after = (e => thread.run());
        return thread;
    }
}
