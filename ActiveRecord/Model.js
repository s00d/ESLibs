import {bind} from "/Support/helpers";
import Dispatcher from "/Events/Dispatcher";
import Collection from "/Support/Collection";
/**
 * Model
 */
export default class Model {
    /**
     * Model identifiers collection WeakMap<Model, String>
     *
     * @type {WeakMap}
     */
    static $uuid = new WeakMap();

    /**
     * Model unique name
     *
     * @returns {V}
     */
    static get uuid() {
        if (!this.$uuid.has(this)) {
            this.$uuid.set(this, 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            }))
        }
        return this.$uuid.get(this);
    }

    /**
     * Model collections map WeakMap<Model, Collection>
     *
     * @type {WeakMap}
     */
    static $collections = new WeakMap();

    /**
     * Return collection for target model and create method links for model to target collection
     *
     * @returns {Collection}
     */
    static get collection() {
        this.bootIfNotBooted();

        if (!this.$collections.has(this)) {
            this.$collections.set(this, new Collection([]));

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
        }

        return this.$collections.get(this);
    }

    /**
     * Event dispatchers collection WeakMap<Model, Dispatcher>
     *
     * @type {WeakMap}
     */
    static $dispatchers = new WeakMap();

    /**
     * Take event dispatcher for target model
     *
     * @returns {Dispatcher}
     */
    static get dispatcher() {
        this.bootIfNotBooted();

        if (!this.$dispatchers.has(this)) {
            this.$dispatchers.set(this, new Dispatcher);
        }
        return this.$dispatchers.get(this);
    }

    /**
     * Subscribe on event
     *
     * @param event
     * @param callback
     * @returns {EventObject}
     */
    static on(event, callback:Function) {
        this.bootIfNotBooted();

        return this.dispatcher.listen(event, callback);
    }

    /**
     * @returns {Collection}
     */
    static query() {
        return this.collection;
    }

    /**
     * Booted status collection WeakMap<Model, Boolean>
     *
     * @type {WeakMap}
     */
    static $booted = new WeakMap();

    /**
     * Return true if static constructor was called
     *
     * @returns {boolean}
     */
    static get booted() {
        if (!this.$booted.has(this)) {
            this.$booted.set(this, false);
        }
        return this.$booted.get(this);
    }

    /**
     * Boot dynamic relations and call static constructor once for every children
     *
     * @returns {Model}
     */
    static bootIfNotBooted() {
        if (!this.booted) {
            this.$booted.set(this, true);

            this.collection;
            this.dispatcher;

            this.constructor();
        }
        return this;
    }

    /**
     * Create a new instance from given attributes and add in collection
     *
     * @param attributes
     * @returns {Model}
     */
    static create(attributes = {}) {
        this.bootIfNotBooted();


        attributes = this.dispatcher.fire('creating', attributes);
        if (!attributes) {
            return false;
        }

        var model = new this(attributes);

        this.collection.push(model);

        this.dispatcher.fire('created', model);

        return model;
    }

    /**
     * Static constructor (run after calling bootIfNotBooted)
     *
     * @return void
     */
    static constructor() {
        // Do nothing
    }

    //
    // ================ INSTANCE ================
    //


    /**
     * Original attributes
     *
     * @type {{}}
     */
    original = {};

    /**
     * Current values of attributes
     *
     * @type {{}}
     */
    attributes = {};

    /**
     * Updated values of attributes (this.original <=> this.attributes diff)
     *
     * @type {{}}
     */
    updated = {};

    /**
     * A new model instance
     *
     * @param attributes
     */
    constructor(attributes = {}) {
        this.constructor.bootIfNotBooted();

        this.fill(attributes);
    }

    //
    // =============== PROPERTIES AND RELATIONS ===============
    //

    /**
     * Fill attributes and create accessors
     *
     * @param attributes
     */
    fill(attributes = {}) {
        this.original = this.attributes = attributes;

        for (let attribute in attributes) {
            if (typeof this[attribute] == 'undefined') {
                Object.defineProperty(this, attribute, {
                    enumerable: true,
                    get:        () => this.get(attribute),
                    set:        value => this.set(attribute, value)
                })
            }
        }
    }

    /**
     * Get attribute from attributes
     *
     * @param attribute
     * @returns {*}
     */
    get(attribute) {
        if (this.has(attribute)) {
            return this.attributes[attribute];
        }
        return null;
    }

    /**
     * Set new attribute value
     *
     * @param attribute
     * @param value
     * @returns {Model}
     */
    set(attribute, value) {
        if (this.has(attribute)) {
            this.attributes[attribute] = value;
            this.updated[attribute]    = value;
        }
        return this;
    }

    /**
     * Checking attribute for existing
     *
     * @param attribute
     * @returns {boolean}
     */
    has(attribute) {
        return typeof this.original[attribute] !== 'undefined';
    }

    /**
     * Create one2one memory relation
     *
     * @param {Model} model
     * @param localKey
     * @param foreignKey
     */
    hasOne(model:Model, localKey = null, foreignKey = 'id') {
        model.bootIfNotBooted();

        if (!localKey) {
            localKey = model.toLowerCase() + '_id';
        }
        return model.find(item => this[localKey] == item[foreignKey]).first();
    }

    /**
     * Create one2many relation
     *
     * @param {Model} model
     * @param localKey
     * @param foreignKey
     */
    hasMany(model:Model, localKey = 'id', foreignKey = null) {
        model.bootIfNotBooted();

        if (!foreignKey) {
            foreignKey = model.toLowerCase() + '_id';
        }
        return model.find(item => this[localKey] == item[foreignKey]);
    }

    /**
     * Returns true if attribute values was be updated
     *
     * @returns {boolean}
     */
    dirty() {
        return Object.keys(this.updated).length > 0;
    }

    /**
     * Reset attributes to default
     *
     * @returns {Model}
     */
    reset() {
        this.attributes = this.original;
        return this;
    }

    /**
     * Sync original values from updated
     *
     * @returns {Model}
     */
    sync() {
        this.original = this.attributes;
        this.updated  = {};
        return this;
    }

    //
    // =============== COLLECTION ACTIONS ===============
    //

    /**
     * Return true if model exists in collection
     *
     * @returns {boolean}
     */
    saved() {
        return this.constructor.collection
                .find(item => this === item)
                .length > 0;
    }

    /**
     * Remove model from collection
     *
     * @returns {Collection}
     */
    remove() {
        if (!this.constructor.dispatcher.fire('deleting', this)) {
            return this.constructor.collection;
        }

        var result = this.constructor.collection
            .remove(item => item === this);

        this.constructor.dispatcher.fire('deleted', this);

        return result;
    }

    /**
     * Clone an object
     *
     * @returns {Model}
     */
    clone() {
        var attributes = {};
        for (var field in this.attributes) {
            var value      = this.attributes[field];
            var isClonable = !(typeof value === 'function' || typeof value === 'object');

            attributes[field] = isClonable ? value : JSON.parse(JSON.stringify(value));
        }

        var clone = new this.constructor({});
        clone.fill(attributes);
        return clone;
    }

    //
    // =============== SERIALIZATION ===============
    //

    /**
     * Convert to Object instance
     *
     * @return {{}}
     */
    toObject() {
        return JSON.parse(this.toJson());
    }

    /**
     * Convert to Json string
     *
     * @returns {string}
     */
    toJson() {
        return JSON.stringify(this.attributes);
    }
}
