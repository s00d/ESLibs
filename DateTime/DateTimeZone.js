import timezones from "/DateTime/timezones";
import Collection from "/Support/Collection";
import {Serialized} from "/Support/Serialize";
import {TIME_SECOND, TIME_MINUTE, TIME_HOUR} from "/DateTime/DateInterval";

/**
 * DateTimeZone
 */
export default class DateTimeZone {
    /**
     * @param {string} name
     * @throws Error
     * @returns DateTimeZone
     */
    static createFromLocation(name) {
        var location = new Collection(timezones)
            .where('name', name)
            .first();

        if (!location) {
            throw new Error(`Location "${name}" not found.`);
        }

        return this.seconds(location.offset)
    }

    /**
     * @param {string|number|DateTimeZone} value milliseconds
     * @returns {DateTimeZone}
     */
    static create(value) {
        if (typeof value === 'object' && value instanceof DateTimeZone) {
            return new this(value.milliseconds);
        } else if (parseInt(value) == value) {
            return new this(parseInt(value));
        }
        return this.createFromLocation(value);
    }

    /**
     * @returns {DateTimeZone}
     */
    static utc() {
        return new this(0);
    }

    /**
     * @param milliseconds
     * @returns {DateTimeZone}
     */
    static milliseconds(milliseconds = 0) {
        return new this(milliseconds);
    }

    /**
     * @param seconds
     * @returns {DateTimeZone}
     */
    static seconds(seconds = 0) {
        return new this(seconds * TIME_SECOND);
    }

    /**
     * @param minutes
     * @returns {DateTimeZone}
     */
    static minutes(minutes = 0) {
        return new this(minutes * TIME_MINUTE);
    }

    /**
     * @param hours
     * @returns {DateTimeZone}
     */
    static hours(hours = 0) {
        return new this(hours * TIME_HOUR);
    }

    /**
     * Milliseconds
     * @type {number}
     * @private
     */
    _offset = 0;

    /**
     * @param {number} milliseconds
     */
    constructor(milliseconds = 0) {
        this._offset = milliseconds;
    }

    /**
     * @returns {number}
     */
    get milliseconds() {
        return this._offset;
    }

    /**
     * @returns {number}
     */
    get seconds() {
        return this._offset / 1000;
    }

    /**
     * @returns {number}
     */
    get minutes() {
        return this._offset / TIME_MINUTE;
    }

    /**
     * @returns {number}
     */
    get hours() {
        return this._offset / TIME_HOUR;
    }

    /**
     * @returns {{offset: number}}
     */
    [Serialized]() {
        return {offset: this.minutes};
    }
}
