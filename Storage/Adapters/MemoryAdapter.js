import Repository from "/Storage/Repository";
import AbstractAdapter from "/Storage/Adapters/AbstractAdapter";

export default class MemoryAdapter extends AbstractAdapter {
    /**
     * @type {Set}
     */
    keys = new Set;

    /**
     * @type {Map}
     */
    driver = new Map;

    /**
     * @param {String} key
     * @return {{saveUp: number, value: object}}
     */
    get(key:String) {
        if (this.has(key)) {
            return Repository.valueToObject(
                this.driver.get(key)
            );
        }

        return Repository.createValue(null);
    }

    /**
     * @param {String} key
     * @param value
     * @param {Number} mills
     * @return {boolean}
     */
    set(key:String, value, mills:Number = 0) {
        if (!this.keys.has(key)) {
            this.keys.add(key);
        }

        var json = Repository.objectToValue(value, mills);
        this.driver.set(key, json);

        return true;
    }

    /**
     * @param key
     * @return {boolean}
     */
    remove(key:String) {
        if (this.has(key)) {
            this.keys.delete(key);
            this.driver.delete(key);
            return true;
        }
        return false;
    }

    /**
     * @param {String} key
     * @return {boolean}
     */
    has(key:String) {
        return this.keys.has(key) && this.driver.has(key);
    }

    /**
     * @returns {{}}
     */
    all() {
        var result = {};

        for (var key of this.keys.entries()) {
            result[key] = this.get(key);
        }

        return result;
    }
}
