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
    static $collections = new WeakMap();

    /**
     * @returns {BaseCollection}
     */
    static get collection() {
        if (!this.$collections.has(this)) {
            this.$collections.set(this, new BaseCollection([]));

            // Import collection methods
            let collection = this.$collections.get(this);
            for (let method in this.$collections.get(this)) {
                if (collection[method] instanceof Function && typeof this[method] == 'undefined') {
                    Object.defineProperty(this, method, {
                        enumerable: true,
                        get:        () => bind(collection[method], collection)
                    })
                }
            }

            this.bootIfNotBooted();
        }
        return this.$collections.get(this);
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
        model.bootIfNotBooted();

        if (!localKey) {
            localKey = model.toLowerCase() + '_id';
        }
        return model.find(item => this[localKey] == item[foreignKey]).first();
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
        return model.find(item => this[localKey] == item[foreignKey]);
    }
}
