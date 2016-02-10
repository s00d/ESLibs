import timezones from "/DateTime/timezones";
import Collection from "/Support/Collection";
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

        return new this(location.offset)
    }

    /**
     * @returns {DateTimeZone}
     */
    static utc() {
        return new this(0);
    }

    /**
     * @param {string|number} value
     * @returns {DateTimeZone}
     */
    static create(value) {
        if (parseInt(value) == value) {
            return new this(parseInt(value));
        }
        return this.createFromLocation(value);
    }

    /**
     * Milliseconds
     * @type {number}
     * @private
     */
    _offset = 0;

    /**
     * @param {number} seconds
     */
    constructor(seconds = 0) {
        this._offset = seconds * TIME_SECOND;
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
        return this._offset / TIME_SECOND;
    }

    /**
     * @returns {number}
     */
    get hours() {
        return this._offset / TIME_MINUTE;
    }
}
