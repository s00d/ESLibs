import DateInterval, {
    TIME_MILLISECOND,
    TIME_SECOND,
    TIME_MINUTE,
    TIME_HOUR,
    TIME_DAY,
    TIME_WEEK,
    TIME_MONTH,
    TIME_YEAR
} from "/DateTime/DateInterval";
import AbstractTimer from "/DateTime/Timer/AbstractTimer";

/**
 * PeriodicTimer instance
 */
export default class PeriodicTimer extends AbstractTimer {
    /**
     * @type {DateInterval}
     * @private
     */
    _delay = DateInterval.seconds(1);

    /**
     * @type {DateInterval}
     * @private
     */
    _remainder = DateInterval.seconds(1);

    /**
     * @type {DateInterval}
     * @private
     */
    _lastTouch = DateInterval.milliseconds(Date.now());

    /**
     * @type {boolean}
     * @private
     */
    _destroy = false;

    /**
     * @type {number}
     * @private
     */
    _invokesCount = -1;

    /**
     * @type {Array|Function[]}
     * @private
     */
    _after = [];

    /**
     * @type {boolean}
     * @private
     */
    _overlapping = true;

    /**
     * @param {Function} callback
     */
    constructor(callback:Function) {
        super(callback);
        this.touch();
    }

    /**
     * @returns {PeriodicTimer}
     */
    once() {
        return this.repeats(1);
    }

    /**
     * @param count
     * @returns {PeriodicTimer}
     */
    repeats(count = 1) {
        this._invokesCount = count;
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    unlimitedRepeats() {
        return this.repeats(-1);
    }

    /**
     * @returns {PeriodicTimer}
     */
    withoutOverlapping() {
        this._overlapping = false;
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    withOverlapping() {
        this._overlapping = true;
        return this;
    }

    /**
     * @param callback
     */
    then(callback:Function) {
        this._after.push(callback);
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    touch() {
        var diff = this._lastTouch.subMilliseconds(Date.now()).milliseconds;

        this._remainder.set(this._remainder.addMilliseconds(diff));

        this._lastTouch.set(Date.now());

        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    dispose() {
        this._destroy = true;
        return this;
    }

    /**
     * @returns {boolean}
     */
    wantsDispose() {
        return this._destroy;
    }

    /**
     * @returns {boolean}
     */
    wantsFire() {
        return this._remainder.milliseconds < 0;
    }

    /**
     * @param args
     * @returns {PeriodicTimer}
     */
    fire(...args) {
        this.callback(...args);
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    tick() {

        while (this.touch().wantsCompensate()) {

            if (this._invokesCount === 0) {
                this.dispose();
            }

            if (this._invokesCount >= 0) {
                this._invokesCount -= 1;
            }

            if (this.wantsDispose()) {
                for (var i = 0, length = this._after.length; i < length; i++) {
                    this._after[i](this);
                }
                return this;
            }

            this.compensateTimeout().fire(this);

            if (!this._overlapping) {
                return this;
            }
        }

        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    compensateTimeout() {
        this._remainder.set(
            this._remainder.addMilliseconds(this._delay.milliseconds)
        );
        return this;
    }

    /**
     * @returns {boolean}
     */
    wantsCompensate() {
        return this._remainder.milliseconds < 0;
    }

    /**
     * @returns {PeriodicTimer}
     */
    resetTimeout() {
        this._remainder.set(this._delay);
        return this;
    }


    /**
     * @returns {number}
     */
    get delay() {
        return this._delay;
    }

    /**
     * @param {number} value
     */
    set delay(value) {
        this._delay = value;
    }

    /**
     * @param milliseconds
     * @returns {PeriodicTimer}
     */
    everyMillisecond(milliseconds = 1) {
        this._delay.set(TIME_MILLISECOND * milliseconds);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfMillisecond() {
        return this.everyMillisecond(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoMillisecond() {
        return this.everyMillisecond(2);
    }

    /**
     * @param seconds
     * @returns {PeriodicTimer}
     */
    everySecond(seconds = 1) {
        this._delay.set(TIME_SECOND * seconds);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfSecond() {
        return this.everySecond(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoSecond() {
        return this.everySecond(2);
    }

    /**
     * @param minutes
     * @returns {PeriodicTimer}
     */
    everyMinute(minutes = 1) {
        this._delay.set(TIME_MINUTE * minutes);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfMinute() {
        return this.everyMinute(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoMinute() {
        return this.everyMinute(2);
    }

    /**
     * @param hours
     * @returns {PeriodicTimer}
     */
    everyHour(hours = 1) {
        this._delay.set(TIME_HOUR * hours);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfHour() {
        return this.everyHour(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoHour() {
        return this.everyHour(2);
    }

    /**
     * @param weeks
     * @returns {PeriodicTimer}
     */
    everyWeek(weeks = 1) {
        this._delay.set(TIME_WEEK * weeks);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfWeek() {
        return this.everyWeek(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoWeek() {
        return this.everyWeek(2);
    }

    /**
     * @param months
     * @returns {PeriodicTimer}
     */
    everyMonth(months = 1) {
        this._delay.set(TIME_MONTH * months);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfMonth() {
        return this.everyMonth(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoMonth() {
        return this.everyMonth(2);
    }

    /**
     * @param years
     * @returns {PeriodicTimer}
     */
    everyYear(years = 1) {
        this._delay.set(TIME_YEAR * years);
        this.resetTimeout();
        return this;
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyHalfYear() {
        return this.everyYear(0.5);
    }

    /**
     * @returns {PeriodicTimer}
     */
    everyTwoYear() {
        return this.everyYear(2);
    }
}
