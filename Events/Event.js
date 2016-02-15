import Str from "/Support/Std/Str";

export default class Event {
    /**
     * @type {string}
     * @private
     */
    _name = '';

    /**
     * @type {string}
     * @private
     */
    _originalName = '';

    /**
     * @type {Array}
     * @private
     */
    _args = [];

    /**
     * @param {string} name
     * @param {Array} args
     */
    constructor(name, ...args) {
        this._originalName = name;
        this._name         = Str.studlyCase(name);
        this._args         = args;
    }

    /**
     * @returns {string}
     */
    get name():string {
        return this._name;
    }

    /**
     * @returns {*}
     */
    get args():Array {
        return this._args;
    }

    /**
     * @returns {string}
     */
    [Symbol.toPrimitive] () {
        return 'Event ' + this.name;
    }
}
