import Repository from "/Storage/Repository";
import AbstractAdapter from "/Storage/Adapters/AbstractAdapter";

export default class LocalStorageAdapter extends AbstractAdapter {
    /**
     * @type {Storage}
     */
    driver = localStorage;

    /**
     * @param {String} key
     * @return {{saveUp: number, value: object}}
     */
    get(key:String) {
        if (this.has(key)) {
            return Repository.valueToObject(
                this.driver.getItem(this.prefix + key)
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
        var json = Repository.objectToValue(value, mills);
        this.driver.setItem(this.prefix + key, json);

        return true;
    }

    /**
     * @param key
     * @return {boolean}
     */
    remove(key:String) {
        if (this.has(key)) {
            this.driver.removeItem(this.prefix + key);
            return true;
        }
        return false;
    }

    /**
     * @param {String} key
     * @return {boolean}
     */
    has(key:String) {
        return !!this.driver.getItem(this.prefix + key);
    }

    /**
     * @returns {{}}
     */
    all() {
        var result = {};

        var regexp = new RegExp('^' + this.escapedPrefix + '(.*?)$');
        for (var key in this.driver) {
            if (key.toString().match(regexp)) {
                var matches = regexp.exec(key);
                result[matches[1]] = this.get(matches[1]);
            }
        }

        return result;
    }
}
