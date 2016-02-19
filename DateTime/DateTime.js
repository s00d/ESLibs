import Str from "/Support/Std/Str";
import Abstract from "/Support/Access/Abstract";
import DateTimeZone from "/DateTime/DateTimeZone";
import {toObject} from "/Support/Interfaces/Serializable";
import DateInterval, {TIME_HOUR, TIME_MINUTE} from "/DateTime/DateInterval";

/*
 |--------------------------------------------------------------------------|
 |                             DateTime Exceptions                          |
 |--------------------------------------------------------------------------|
 */

/** DateTime Format Error */
class DateTimeFormatError extends Error {
}


/*
 |--------------------------------------------------------------------------|
 |                             DateTime Format parsers                      |
 |--------------------------------------------------------------------------|
 */

class AbstractDateTimeFormat {
    @Abstract parse(string) {
    }
}


/**
 * Parser for "yyyy-mm-dd hh:ii:ss" || "yyyy.mm.dd hh:ii:ss"
 */
class DateTimeStringFormat extends AbstractDateTimeFormat {
    /**
     * @type {RegExp}
     */
    pattern = /^(?:\-|\.)[0-9]{4}(?:\-|\.)[0-9]{2}(?:\-|\.)[0-9]{2}(?:\s[0-9]{2}:[0-9]{2}:[0-9]{2})?/;

    /**
     * @param string
     * @returns {Date}
     */
    parse(string) {
        if (typeof string === 'string' && string.match(this.pattern)) {
            var timeArguments = string.split(/\-|:|\s|\./);
            timeArguments[1]  = (timeArguments[1] - 1);

            return new Date(
                Date.UTC.apply(Date, timeArguments) +
                (new Date).getTimezoneOffset() * 60 * 1000
            );
        }

        return null;
    }
}

/**
 * Parser for "dd-mm-yyyy hh:ii:ss" || "dd.mm.yyyy hh:ii:ss"
 */
class DateTimeReverseStringFormat extends AbstractDateTimeFormat {
    /**
     * @type {RegExp}
     */
    pattern = /^(?:\-|\.)?[0-9]{2}(?:\-|\.)[0-9]{2}(?:\-|\.)[0-9]{4}(?:\s[0-9]{2}:[0-9]{2}:[0-9]{2})?/;

    /**
     * @param string
     * @returns {Date}
     */
    parse(string) {
        if (typeof string === 'string' && string.match(this.pattern)) {
            var timeArguments = string.split(/\-|:|\s|\./);
            timeArguments[1]  = (timeArguments[1] - 1);
            var [d, m, y, h, i, s] = timeArguments;

            return new Date(
                Date.UTC(y, m, d, h, i, s) +
                (new Date).getTimezoneOffset() * 60 * 1000
            );
        }

        return null;
    }
}


/*
 |--------------------------------------------------------------------------|
 |                             Public interface                             |
 |--------------------------------------------------------------------------|
 */
export default class DateTime {
    /**
     * @type {DateTimeZone}
     */
    static timezone = DateTimeZone.utc();

    /**
     * @param {string|number|DateTimeZone} timezone milliseconds
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
     * @type {*[]|AbstractDateTimeFormat[]}
     * @private
     */
    static _parsers = [
        // Y-m-d H:i:s
        new DateTimeStringFormat,
        // d-m-Y H:i:s
        new DateTimeReverseStringFormat
    ];

    /**
     * Seconds
     * @type {number}
     */
    _timestamp = null;

    /**
     * @type {DateTimeZone}
     * @private
     */
    _timezone = DateTimeZone.utc();

    /**
     * @param {DateTime|Date} time
     */
    constructor(time) {
        var browserTimezoneOffset = () => (new Date).getTimezoneOffset() * 60 * 1000 * -1;
        var serverTimezoneOffset  = () => this.constructor.getTimezone().milliseconds;

        if (!time) {
            time = new Date();
        }

        this.timezone = this.constructor.getTimezone();

        switch (typeof time) {
            case 'number':
                // For UTC Timestamps
                /* this._timestamp = time; */

                // For Browser compensate
                /* this._timestamp = time + browserTimezoneOffset(); */

                this._timestamp = time - this.timezone.milliseconds;
                break;

            case 'string':
                var date   = new Date(time);
                var parsed = null;

                if (date.getTime()) {
                    parsed = date;

                } else {
                    for (var parser of this.constructor._parsers) {
                        if (parsed = parser.parse(time, this.timezone.milliseconds)) {
                            break;
                        }
                    }

                    if (!parsed) {
                        throw new DateTimeFormatError('Date format error')
                    }
                }

                this._timestamp = parsed.getTime() + parsed.getTimezoneOffset() * 60 * 1000;

                break;

            case 'object':
                if (time instanceof DateTime) {
                    this._timestamp = time._timestamp;
                    this.timezone   = time._timezone;

                } else if (time instanceof Date) {
                    this._timestamp = time.getTime() + time.getTimezoneOffset() * 60 * 1000;
                }
        }

        if (this._timestamp === null) {
            throw new DateTimeFormatError('Date format error');
        }
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
     * @returns {DateTimeZone|number}
     */
    get timezone() {
        return this._timezone;
    }

    /**
     * @param {DateTimeZone|number} tz
     */
    set timezone(tz) {
        if (typeof tz === 'number') {
            tz = DateTimeZone.create(tz);
        }
        this._timezone = tz;
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
     * @param format
     * @returns {string}
     */
    format(format) {
        return format.toString()
            .replace('Y', this.year)
            .replace('y', this.year.toString().substr(2))
            .replace('m', Str.zeroFirst(this.month, 2))
            .replace('d', Str.zeroFirst(this.day, 2))
            .replace('H', Str.zeroFirst(this.hours, 2))
            .replace('h', Str.zeroFirst(this.hours > 12 ? this.hours - 12 : this.hours, 2))
            .replace('G', this.hours)
            .replace('g', this.hours > 12 ? this.hours - 12 : this.hours)
            //.replace('I', this.minutes) // @TODO: Winter time / Summer time
            .replace('i', Str.zeroFirst(this.minutes, 2))
            .replace('s', Str.zeroFirst(this.seconds, 2))
            .replace('a', this.hours > 12 ? 'pm' : 'am')
            .replace('D', '%day%')   // Fix for char overriding
            .replace('M', '%month%') // Fix for char overriding
            .replace('%day%', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][this.day])
            .replace('%month%', ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
                'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][this.month])
            ;
    }

    /**
     * @returns {Date}
     */
    get date() {
        return new Date(this.timestamp);
    }

    /**
     * Milliseconds
     * @returns {number}
     */
    get timestamp() {
        return this._timestamp + this.timezone.milliseconds;
    }

    /**
     * @returns {Date}
     */
    toDate() {
        return this.date;
    }

    /**
     * @returns {string}
     */
    toIso8601String() {
        return this.date.toISOString();
    }

    /**
     * @returns {string}
     */
    toRfc1036String() {
        var tzHours   = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_HOUR) % 24);
        var tzMinutes = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_MINUTE) % 60);
        var tzDigit   = this.timezone.milliseconds > 0 ? '+' : '-';

        return this.format(`D, d M y H:i:s ${tzDigit}${tzHours}${tzMinutes}`);
    }

    /**
     * @returns {string}
     */
    toRfc2822String() {
        var tzHours   = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_HOUR) % 24);
        var tzMinutes = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_MINUTE) % 60);
        var tzDigit   = this.timezone.milliseconds > 0 ? '+' : '-';

        return this.format(`D, d M Y H:i:s ${tzDigit}${tzHours}${tzMinutes}`);
    }

    /**
     * @returns {string}
     */
    toRfc1123String() {
        return this.toRfc2822String();
    }

    /**
     * @returns {string}
     */
    toRfc3339String() {
        var tzHours   = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_HOUR) % 24);
        var tzMinutes = Str.zeroFirst(Math.floor(this.timezone.milliseconds / TIME_MINUTE) % 60);
        var tzDigit   = this.timezone.milliseconds > 0 ? '+' : '-';

        return this.format(`Y-m-dTH:i:s${tzDigit}${tzHours}:${tzMinutes}`);
    }

    /**
     * @returns {string}
     */
    toW3cString() {
        return this.toRfc3339String();
    }

    /**
     * @returns {string}
     */
    toAtomString() {
        return this.toRfc3339String();
    }

    /**
     * @returns {string}
     */
    toDateTimeString() {
        return this.format('Y-m-d H:i:s');
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.toDateTimeString();
    }

    /**
     * @returns {string}
     */
    [Symbol.toPrimitive]() {
        return this.toString();
    }

    /**
     * @returns {{date: string, timezone: (DateTimeZone|number)}}
     */
    [toObject] () {
        return {
            date: this.toDateTimeString(),
            timezone: this.timezone
        };
    }
}
