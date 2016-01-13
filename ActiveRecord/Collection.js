import Arr from "/Support/Arr";
import {bind} from "/Support/helpers";
import Model from "/ActiveRecord/Model";
import {default as BaseCollection} from "/Support/Collection";

/**
 * Eloquent collection
 */
export default class Collection extends Model {
    /**
     * Booted status collection WeakMap<Model, BaseCollection>
     *
     * @type {WeakMap}
     */
    static _collections = new WeakMap();

    /**
     * @returns {BaseCollection}
     */
    static get collection() {
        if (!this._collections.has(this)) {
            this._collections.set(this, new BaseCollection([]));

            // Import collection methods
            let collection = this._collections.get(this);
            let keys       = Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(collection));

            for (let method in keys) {
                if (collection[method] instanceof Function && typeof this[method] == 'undefined') {
                    Object.defineProperty(this, method, {
                        enumerable: true,
                        get:        () => bind(collection[method], collection)
                    })
                }
            }

            this.bootIfNotBooted();
        }
        return this._collections.get(this);
    }

    /**
     * Override boot method
     *
     * @returns {Model}
     */
    static bootIfNotBooted() {
        if (!this.booted) {
            super.bootIfNotBooted();
            this.collection;
        }
        return this;
    }

    /**
     * @param attributes
     * @returns {attributes}
     */
    static create(attributes = {}) {
        var model = super.create(attributes);

        this.collection.push(model);

        return model;
    }

    /**
     * ActiveRecord collection
     *
     * @returns {BaseCollection}
     */
    static query() {
        return this.collection;
    }


    // === RELATIONS === //


    /**
     * Create one2one memory relation
     *
     * @param {Collection} model
     * @param localKey
     * @param foreignKey
     */
    hasOne(model:Collection, localKey = null, foreignKey = 'id') {
        return this.hasMany(model, localKey, foreignKey).first();
    }

    /**
     * Create one2many relation
     *
     * @param {Collection} model
     * @param localKey
     * @param foreignKey
     */
    hasMany(model:Collection, localKey = 'id', foreignKey = null) {
        model.bootIfNotBooted();

        if (!foreignKey) {
            foreignKey = model.toLowerCase() + '_id';
        }

        var haystack = Arr.make(this._attributes.get(localKey));
        return model.find(item => Arr.has(haystack, item._attributes.get(foreignKey)));
    }

    /**
     * In collection
     *
     * @returns {boolean}
     */
    get saved() {
        return this.constructor.where('$id', this.$id).length > 0;
    }
}
