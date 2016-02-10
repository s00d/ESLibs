import Obj from "/Support/Obj";

export default class Dictionary {
    /**
     * @type {{}}
     * @private
     */
    _original = {};

    /**
     * @type {{}}
     * @private
     */
    _flat = {};

    /**
     * @param key
     * @param value
     * @returns {Dictionary}
     */
    add(key, value) {
        return this.addMany(Obj.make(key, value));
    }

    /**
     * @param data
     * @param prefix
     * @returns {Dictionary}
     */
    addMany(data = {}, prefix = '') {
        this._original = Obj.merge(this._original, data);
        this._flat     = Obj.merge(this._flat, Obj.reduce(data, prefix));
        return this;
    }

    /**
     * @param key
     * @returns {string|object|array}
     */
    get(key) {
        if (this._original[key] != null) {
            return this._original[key];
        }
        if (this._flat[key] != null) {
            return this._flat[key];
        }

        // @TODO add search
        return '';
    }

    /**
     * @returns {{}}
     */
    getAllFlat() {
        return this._flat;
    }

    /**
     * @returns {{}}
     */
    getAll() {
        return this._original;
    }

    /**
     * @param args
     * @returns {{}}
     */
    withAttributes(args = {}) {
        return Obj.merge(this._flat, Obj.reduce(args, ''));
    }
}
