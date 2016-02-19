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
     * @type {Array|Collection}
     * @private
     */
    _args = [];

    /**
     * @type {Function}
     * @private
     */
    _updateCallback = (() => null);

    /**
     * @param {string} name
     * @param {Array} args
     */
    constructor(name, args:Array) {
        this._originalName = name;
        this._name         = Str.studlyCase(name);
        this._args         = args;
    }

    /**
     * @param callback
     * @returns {Event}
     */
    onUpdate(callback:Function) {
        this._updateCallback = callback;
        return this;
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
     * @returns {*}
     */
    get value() {
        return this._args.length > 0 ? this._args[0] : null;
    }

    /**
     * @param value
     */
    set value(value) {
        this._updateCallback(value);
    }

    /**
     * Iterator
     */
    *[Symbol.iterator] () {
        for (var i = 0; i < this._args.length; i++) {
            yield this._args[i];
        }
    }

    /**
     * @returns {string}
     */
    [Symbol.toPrimitive] () {
        return 'Event ' + this.name;
    }
}
