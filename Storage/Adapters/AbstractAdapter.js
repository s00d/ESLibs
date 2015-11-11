import Abstract from "/Support/Abstract";

/**
 * Abstract adapter
 */
export default class AbstractAdapter {
    /**
     * @type {string}
     */
    prefix = 'storage.';

    /**
     * @returns {string}
     */
    get escapedPrefix() {
        return this.prefix.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    /**
     * @param {string|null} prefix
     */
    constructor(prefix = null) {
        this.prefix = prefix || this.prefix;
    }

    /**
     * @param {String} key
     * @return {{saveUp: number, value: object}}
     */
    @Abstract get(key:String) {  }

    /**
     * @param {String} key
     * @param value
     * @param {Number} mills
     * @return {boolean}
     */
    @Abstract set(key:String, value, mills:Number = -1) {  }

    /**
     * @param key
     * @return {boolean}
     */
    @Abstract remove(key:String) {  }

    /**
     * @param {String} key
     * @return {boolean}
     */
    @Abstract has(key:String) {  }

    /**
     * @return {{}}
     */
    @Abstract all() {  }
}
