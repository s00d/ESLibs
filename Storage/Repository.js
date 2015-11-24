import AbstractAdapter from "/Storage/Adapters/AbstractAdapter";
import LocalStorageAdapter from "/Storage/Adapters/LocalStorageAdapter";

/**
 * Data repository
 */
export default class Repository {
    /**
     * @param {String} prefix
     * @returns {Repository}
     */
    static create(prefix:String) {
        return new this(new LocalStorageAdapter(prefix));
    }

    /**
     * @type {AbstractAdapter}
     */
    adapter = null;

    /**
     * @param adapter
     */
    constructor(adapter:AbstractAdapter = null) {
        this.adapter = adapter || new LocalStorageAdapter();
    }

    /**
     * @param key
     * @returns {*}
     */
    get(key:String) {
        if (this.has(key)) {
            return this.adapter.get(key).value;
        }
        return null;
    }

    /**
     * @param key
     * @param value
     * @param seconds
     * @returns {Repository}
     */
    set(key:String, value, seconds:Number = 0) {
        this.adapter.set(key, value || null, seconds * 1000);
        return this;
    }

    /**
     * @param key
     * @param seconds
     * @param callback
     * @returns {Repository}
     */
    remember(key:String, seconds:Number = 0, callback:Function) {
        if (!this.has(key)) {
            this.set(key, seconds, callback());
        }
        return this;
    }

    /**
     * @param key
     * @returns {Number}
     */
    accessTime(key:String):Number {
        if (!this.has(key)) {
            return -1;
        }

        var timeout = this.adapter.get(key).saveUp;
        if (timeout === 0) {
            return 0;
        }

        return (this.adapter.get(key).saveUp - (new Date).getTime()) / 1000;
    }

    /**
     * @param key
     * @param callback
     * @returns {Repository}
     */
    rememberForever(key:String, callback:Function) {
        return this.remember(key, 0, callback);
    }

    /**
     * @param key
     * @returns {boolean}
     */
    has(key:String) {
        var value = this.adapter.get(key);
        if (value.value) {
            if (value.saveUp === 0) {
                return true;
            } else if (value.saveUp >= (new Date).getTime()) {
                return true;
            } else {
                this.remove(key);
            }
        }
        return false;
    }

    /**
     * @returns {Repository}
     */
    clear() {
        for (var key in this.adapter.all()) {
            this.adapter.remove(key);
        }
        return this;
    }

    /**
     * @param key
     * @returns {boolean}
     */
    remove(key:String) {
        return this.adapter.remove(key);
    }

    /**
     * @returns {{}}
     */
    all() {
        var result = {};
        for (var key in this.adapter.all()) {
            if (this.has(key)) {
                result[key] = this.get(key);
            }
        }
        return result;
    }

    /**
     * @returns {Number}
     */
    get length() {
        return Object.keys(this.all()).length;
    }

    /**
     * @param object
     * @param mills
     * @returns {{saveUp: number, value}}
     */
    static createValue(object, mills:Number = 0) {
        return {
            saveUp: mills <= 0 ? 0 : (new Date).getTime() + mills,
            value:  Serialize.toStructure(object)
        }
    }

    /**
     * @param object
     * @param mills
     * @returns {string}
     */
    static objectToValue(object, mills:Number = 0) {
        return JSON.stringify(this.createValue(object, mills));
    }

    /**
     * @param string
     * @returns {{saveUp: number, value: object}}
     */
    static valueToObject(string) {
        return JSON.parse(string);
    }
}
