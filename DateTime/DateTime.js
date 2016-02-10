import DateTimeZone from "/DateTime/DateTimeZone";
import DateInterval from "/DateTime/DateInterval";

/**
 *
 */
export default class DateTime {
    /**
     * @type {DateTimeZone}
     */
    static timezone = DateTimeZone.utc();

    /**
     * @param timezone
     * @returns {DateTime}
     */
    static setTimezone(timezone) {
        this.timezone = DateTimeZone.create(timezone);
        return this;
    }

    /**
     * @returns {DateTimeZone}
     */
    static getTimezone() {
        return this.timezone;
    }

    /**
     * @returns {DateTime}
     */
    static now() {
        return new DateTime();
    }

    /**
     * Milliseconds
     * @type {number}
     */
    _timestamp = 0;

    /**
     * @type {DateTimeZone}
     * @private
     */
    _timezone = DateTimeZone.utc();

    /**
     * @param {number|Date} time
     */
    constructor(time) {
        if (!time) {
            time = Date.now();
        }
        this._timestamp = time;
        this.timezone   = this.constructor.getTimezone();
    }

    /**
     * @param date
     * @returns {DateInterval}
     */
    diff(date) {
        date = new this.constructor(date);

        return new DateInterval(this._timestamp)
            .subMilliseconds(date.milliseconds);
    }

    /**
     * @returns {DateTimeZone}
     */
    get timezone() {
        return this._timezone;
    }

    /**
     * @param {DateTimeZone} tz
     */
    set timezone(tz) {
        this._timezone   = tz;
        this._timestamp -= tz.milliseconds;
    }

    /**
     * @returns {number}
     */
    get year() {
        return this.date.getFullYear();
    }

    /**
     * @returns {number}
     */
    get month() {
        return this.date.getMonth() + 1;
    }

    /**
     * @returns {number}
     */
    get day() {
        return this.date.getDate();
    }

    /**
     * @returns {number}
     */
    get hours() {
        return this.date.getHours();
    }

    /**
     * @returns {number}
     */
    get minutes() {
        return this.date.getMinutes();
    }

    /**
     * @returns {number}
     */
    get seconds() {
        return this.date.getSeconds();
    }

    /**
     * @returns {number}
     */
    get milliseconds() {
        return this.date.getMilliseconds();
    }

    /**
     * @returns {number}
     */
    get timestamp() {
        return this._timestamp;
    }

    /**
     * @param format
     * @returns {XML|string}
     */
    format(format) {
        return format
            .replace('Y', this.year)
            .replace('y', this.year.toString().substr(2))
            //.replace('M', this.month) // @TODO: text format
            .replace('m', this.month > 9 ? this.month : ('0' + this.month))
            //.replace('D', this.day) // @TODO: text format
            .replace('d', this.day > 9 ? this.day : ('0' + this.day))
            .replace('H', this.hours > 9 ? this.hours : ('0' + this.hours))
            .replace('h', this.hours > 12 ? this.hours - 12 : this.hours) // @TODO: with zero first
            .replace('G', this.hours)
            .replace('g', this.hours > 12 ? this.hours - 12 : this.hours)
            //.replace('I', this.minutes) // @TODO: Winter time / Summer time
            .replace('i', this.minutes > 9 ? this.minutes : ('0' + this.minutes))
            .replace('s', this.seconds > 9 ? this.seconds : ('0' + this.seconds))
            .replace('a', this.hours > 12 ? 'pm' : 'am');
    }

    /**
     * @returns {Date}
     */
    get date() {
        return new Date(this.timestamp + this.timezone.milliseconds);
    }

    /**
     * @returns {Date}
     */
    toDate() {
        return this.date;
    }

    /**
     * @returns {*}
     */
    toIso8601String() {
        return this.date.toISOString();
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.date.toString();
    }

    /**
     * @returns {{time: string, zone: number}}
     */
    toObject() {
        return {
            time: this.toIso8601String(),
            zone: this.timezone
        };
    }

}
