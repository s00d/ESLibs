import Config from "/App/Config";

/**
 *
 */
export default class Carbon {
    /**
     * @type {number}
     */
    static timezone = 0;

    /**
     * @param timezone
     * @returns {Carbon}
     */
    static setServerTimezone(timezone) {
        this.timezone = timezone;
        return this;
    }

    /**
     * @returns {number}
     */
    static getServerTimezone() {
        return this.timezone;
    }

    /**
     * @param string
     * @returns {Carbon}
     */
    static parse(string) {
        if (string instanceof Carbon) {
            return string;

        } else if (string instanceof Date) {
            console.log(string);
            return new Carbon(string.getTime());

        } else if (string instanceof Object) {
            string = string.date;
        }

        var pattern = /^\-?[0-9]{4}\-[0-9]{2}\-[0-9]{2}(?:\s[0-9]{2}:[0-9]{2}:[0-9]{2})?/;

        if (string.match(pattern)) {
            var timezone      = this.getServerTimezone();
            var timezoneMills = timezone * 60 * 60 * 1000;
            var timeArguments = string.split(/\-|:|\s|\./);
            timeArguments[1]  = (timeArguments[1] - 1);
            var timestamp     = Date.UTC.apply(Date, timeArguments) - timezoneMills;

            return new Carbon(timestamp);
        }

        return new Carbon(string);
    }

    /**
     * @returns {Carbon}
     */
    static now() {
        return new Carbon();
    }

    /**
     * @type {Date}
     */
    date = null;

    /**
     * @param args
     */
    constructor(...args) {
        this.date = new Date(...args);
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
        return this.date.getTime();
    }

    /**
     * @returns {number}
     */
    get timezone() {
        return this.getTimezoneOffset() * -1 / 60;
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
        return this.date.toLocaleString();
    }
}
