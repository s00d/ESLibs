/**
 * Linear animation class
 */
export default class Linear {
    /**
     * @type {number}
     */
    min = 0;

    /**
     * @type {number}
     */
    max = 100;

    /**
     * @type {number}
     */
    target = 0;

    /**
     * @type {number}
     */
    speed = 1;

    /**
     * @type {number}
     */
    current = 0;

    /**
     * @type {null|number}
     */
    interval = null;

    /**
     * @type {null|Function}
     */
    callback = null;

    /**
     * @param callback
     */
    constructor(callback: Function) {
        this.callback = callback;
        this.callback(this.current, this);
    }

    /**
     * @param value
     * @param after
     */
    set(value, after:Function) {
        this.target = value;
        this.resetInterval();

        if (value <= this.min) {
            value = this.min;
        } else if (value >= this.max) {
            value = this.max;
        }

        var speed = value > this.current ? this.speed : -this.speed;

        this.interval = setInterval(() => {
            this.callback(this.current, this);

            var isEnd = (speed > 0 && this.current >= value) ||
                (speed <= 0 && this.current <= value);

            if (isEnd) {
                this.current = speed > 0 ? this.max : this.min;
                this.resetInterval();
                if (after) {
                    after(this);
                }
            } else {
                this.current += speed;
            }

        }, 10);
    }

    /**
     * @param after
     * @returns {*}
     */
    fadeOut(after:Function) {
        return this.set(this.min, after);
    }

    /**
     * @param after
     * @returns {*}
     */
    fadeIn(after:Function) {
        return this.set(this.max, after);
    }

    /**
     * @returns {Linear}
     */
    resetInterval() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        return this;
    }
}
