import DateTime from "/DateTime/DateTime";

export const TIME_MILLISECOND = 1;
export const TIME_SECOND      = TIME_MILLISECOND * 1000;
export const TIME_MINUTE      = TIME_SECOND * 60;
export const TIME_HOUR        = TIME_MINUTE * 60;
export const TIME_DAY         = TIME_HOUR * 24;
export const TIME_WEEK        = TIME_DAY * 7;
export const TIME_MONTH       = TIME_DAY * 30;
export const TIME_YEAR        = TIME_DAY * 365;


/**
 * DateInterval class
 */
export default class DateInterval {
    /**
     * @param {number} milliseconds
     * @returns {DateInterval}
     */
    static milliseconds(milliseconds = 1) {
        return new this(milliseconds);
    }

    /**
     * @param {number} seconds
     * @returns {DateInterval}
     */
    static seconds(seconds = 1) {
        return new this(TIME_SECOND * seconds);
    }

    /**
     * @param {number} minutes
     * @returns {DateInterval}
     */
    static minutes(minutes = 1) {
        return new this(TIME_MINUTE * minutes);
    }

    /**
     * @param {number} hours
     * @returns {DateInterval}
     */
    static hours(hours = 1) {
        return new this(TIME_HOUR * hours);
    }

    /**
     * @param {number} days
     * @returns {DateInterval}
     */
    static days(days = 1) {
        return new this(TIME_DAY * days);
    }

    /**
     * @param {number} weeks
     * @returns {DateInterval}
     */
    static weeks(weeks = 1) {
        return new this(TIME_WEEK * weeks);
    }

    /**
     * @param {number} months
     * @returns {DateInterval}
     */
    static months(months = 1) {
        return new this(TIME_MONTH * months);
    }

    /**
     * @param {number} years
     * @returns {DateInterval}
     */
    static years(years = 1) {
        return new this(TIME_YEAR * years);
    }

    /**
     * @type {number}
     * @private
     */
    _milliseconds = 0;

    /**
     * @param {Date|DateInterval|DateTime|number} date
     */
    constructor(date) {
        if (date instanceof Date) {
            this._milliseconds = date.getTime();
        } else if (
            date instanceof DateInterval ||
            date instanceof DateTime
        ) {
            this._milliseconds = date.milliseconds;
        } else if (date) {
            this._milliseconds = parseInt(date);
        }
    }

    /**
     * @param {Date|DateInterval|DateTime|number} date
     * @returns {DateInterval}
     */
    sub(date) {
        return this.subMilliseconds(
            (new this.constructor(date)).milliseconds
        );
    }

    /**
     * @param {Date|DateInterval|DateTime|number} date
     * @returns {DateInterval}
     */
    add(date) {
        return this.addMilliseconds(
            (new this.constructor(date)).milliseconds
        );
    }

    /**
     * @returns {number}
     */
    get milliseconds() {
        return this._milliseconds;
    }

    /**
     * @returns {number}
     */
    get seconds() {
        return this._milliseconds / TIME_SECOND;
    }

    /**
     * @returns {number}
     */
    get minutes() {
        return this._milliseconds / TIME_MINUTE;
    }

    /**
     * @returns {number}
     */
    get hours() {
        return this._milliseconds / TIME_HOUR;
    }

    /**
     * @returns {number}
     */
    get days() {
        return this._milliseconds / TIME_DAY;
    }

    /**
     * @returns {number}
     */
    get weeks() {
        return this._milliseconds / TIME_WEEK;
    }

    /**
     * @returns {number}
     */
    get months() {
        return this._milliseconds / TIME_MONTH;
    }

    /**
     * @returns {number}
     */
    get years() {
        return this._milliseconds / TIME_YEAR;
    }

    /**
     * @returns {{years: number, months: number, days: number, hours: number, minutes: number, seconds: number}}
     */
    get date() {
        return {
            milliseconds:   this.milliseconds % 1000,
            seconds:        Math.floor(this.milliseconds / TIME_SECOND) % 60,
            minutes:        Math.floor(this.milliseconds / TIME_MINUTE) % 60,
            hours:          Math.floor(this.milliseconds / TIME_HOUR) % 24,
            days:           Math.floor(this.milliseconds / TIME_DAY) % 30,
            months:         Math.floor(this.milliseconds / TIME_MONTH) % 12,
            years:          Math.floor(this.milliseconds / TIME_YEAR)
        };
    }

    /**
     * @param {number} milliseconds
     * @returns {DateInterval}
     */
    subMilliseconds(milliseconds = 1) {
        return new this.constructor(this._milliseconds - milliseconds);
    }

    /**
     * @param {number} milliseconds
     * @returns {DateInterval}
     */
    addMilliseconds(milliseconds = 1) {
        return new this.constructor(this._milliseconds + milliseconds);
    }

    /**
     * @param {number} seconds
     * @returns {DateInterval}
     */
    subSeconds(seconds = 1) {
        return new this.constructor(this._milliseconds - seconds * TIME_SECOND);
    }

    /**
     * @param {number} seconds
     * @returns {DateInterval}
     */
    addSeconds(seconds = 1) {
        return new this.constructor(this._milliseconds + seconds * TIME_SECOND);
    }

    /**
     * @param {number} minutes
     * @returns {DateInterval}
     */
    subMinutes(minutes = 1) {
        return new this.constructor(this._milliseconds - minutes * TIME_MINUTE);
    }

    /**
     * @param {number} minutes
     * @returns {DateInterval}
     */
    addMinutes(minutes = 1) {
        return new this.constructor(this._milliseconds + minutes * TIME_MINUTE);
    }

    /**
     * @param {number} hours
     * @returns {DateInterval}
     */
    subHours(hours = 1) {
        return new this.constructor(this._milliseconds - hours * TIME_HOUR);
    }

    /**
     * @param {number} hours
     * @returns {DateInterval}
     */
    addHours(hours = 1) {
        return new this.constructor(this._milliseconds + hours * TIME_HOUR);
    }

    /**
     * @param {number} days
     * @returns {DateInterval}
     */
    subDays(days = 1) {
        return new this.constructor(this._milliseconds - days * TIME_DAY);
    }

    /**
     * @param {number} days
     * @returns {DateInterval}
     */
    addDays(days = 1) {
        return new this.constructor(this._milliseconds + days * TIME_DAY);
    }

    /**
     * @param {number} weeks
     * @returns {DateInterval}
     */
    subWeeks(weeks = 1) {
        return new this.constructor(this._milliseconds - weeks * TIME_WEEK);
    }

    /**
     * @param {number} weeks
     * @returns {DateInterval}
     */
    addWeeks(weeks = 1) {
        return new this.constructor(this._milliseconds + weeks * TIME_WEEK);
    }

    /**
     * @param {number} months
     * @returns {DateInterval}
     */
    subMonths(months = 1) {
        return new this.constructor(this._milliseconds - months * TIME_MONTH);
    }

    /**
     * @param {number} months
     * @returns {DateInterval}
     */
    addMonths(months = 1) {
        return new this.constructor(this._milliseconds + months * TIME_MONTH);
    }

    /**
     * @param {number} years
     * @returns {DateInterval}
     */
    subYears(years = 1) {
        return new this.constructor(this._milliseconds - years * TIME_YEAR);
    }

    /**
     * @param {number} years
     * @returns {DateInterval}
     */
    addYears(years = 1) {
        return new this.constructor(this._milliseconds + years * TIME_YEAR);
    }

    /**
     * @returns {boolean}
     */
    isPositive() {
        return this._milliseconds > 0
    }

    /**
     * @returns {boolean}
     */
    isNegative() {
        return this._milliseconds < 0
    }

    /**
     * @param {number|DateInterval} value
     * @returns {DateInterval}
     */
    set(value) {
        if (value instanceof DateInterval) {
            value = value.milliseconds;
        }

        this._milliseconds = parseInt(value);
        return this;
    }

    /**
     * @returns {number}
     */
    toString() {
        return this.milliseconds;
    }
}
