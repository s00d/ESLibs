import Arr from "/Support/Std/Arr";
import DateTime from "/DateTime/DateTime";
import Dispatcher from "/Events/Dispatcher";
import Collection from "/Support/Collection";
import Repository from "/Storage/Repository";
import {toObject} from "/Support/Interfaces/Serializable";
import MemoryAdapter from "/Storage/Adapters/MemoryAdapter";

/**
 * Model
 */
export default class Model {
    /**
     * Booted status collection WeakMap<Model, Boolean>
     *
     * @type {WeakMap}
     */
    static _booted = new WeakMap();

    /**
     * Return true if static constructor was called
     *
     * @returns {boolean}
     */
    static get booted() {
        if (!this._booted.has(this)) {
            this._booted.set(this, false);
            this.bootIfNotBooted();
        }
        return this._booted.get(this);
    }

    /**
     * @type {WeakMap}
     */
    static _timestamps = new WeakMap();

    /**
     * @returns {Array}
     */
    static get timestamps() {
        if (!this._timestamps.has(this)) {
            this._timestamps.set(this, [
                'created_at',
                'updated_at'
            ]);
            this.bootIfNotBooted();
        }
        return this._timestamps.get(this);
    }

    /**
     * @param {Array} value
     */
    static set timestamps(value:Array) {
        this._timestamps.set(this, value);
    }

    /**
     * Event dispatchers collection WeakMap<Model, Dispatcher>
     *
     * @type {WeakMap}
     */
    static _events = new WeakMap();

    /**
     * Take event dispatcher for target model
     *
     * @returns {Dispatcher}
     */
    static get events() {
        this.bootIfNotBooted();

        if (!this._events.has(this)) {
            this._events.set(this, new Dispatcher);
        }
        return this._events.get(this);
    }

    /**
     * @type {WeakMap}
     */
    static _cache = new WeakMap();

    /**
     * @returns {Repository}
     */
    static get cache() {
        this.bootIfNotBooted();

        if (!this._cache.has(this)) {
            this._cache.set(this, new Repository(new MemoryAdapter('cache:')));
        }
        return this._cache.get(this);
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
        return this.events.listen(event, callback);
    }

    /**
     * Fire an event
     *
     * @param event
     * @param args
     * @returns {boolean}
     */
    static fire(event, ...args) {
        this.bootIfNotBooted();
        return this.events.fire(event, ...args);
    }

    /**
     * @param event
     * @param args
     * @param callback
     * @returns {Dispatcher}
     */
    static fireWithOverlap(event, args:Array = [], callback:Function) {
        this.bootIfNotBooted();
        return this.events.fireWithOverlap(event, args, callback);
    }

    /**
     * Boot dynamic relations and call static constructor once for every children
     *
     * @returns {Model}
     */
    static bootIfNotBooted() {
        if (!this.booted) {
            this._booted.set(this, true);
            this.events;
            this.constructor();
        }
        return this;
    }

    /**
     * @param observers
     */
    static observe(...observers) {
        for (let i = 0; i < observers.length; i++) {
            let context = Object.getOwnPropertyDescriptors(Reflect.getPrototypeOf(observers[i]));

            for (let method in context) {
                if (method === 'constructor') {
                    continue;
                }
                this.on(method, (...args) => observers[i][method](...args));
            }
        }
    }

    /**
     * Static constructor
     */
    static constructor() {
        // Do nothing
    }

    /**
     * @type {Map}
     */
    _attributes = new Map();

    /**
     * @type {Map}
     */
    _original = new Map();

    /**
     * @param attributes
     * @returns {Model}
     */
    static create(attributes = {}) {
        return new this(attributes);
    }

    /**
     * Model last unique id
     * @type {number}
     */
    static _id = 0;

    /**
     * Model unique id
     * @type {number}
     */
    _id = ++this.constructor._id;

    /**
     * @param _attributes
     */
    constructor(_attributes = {}) {
        this.constructor.bootIfNotBooted();

        this.constructor.fireWithOverlap('creating', [_attributes], (data) => {
            _attributes = data;
        });

        this.fill(_attributes);

        this.constructor.fire('created', this);
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
     * @param _attributes
     */
    fill(_attributes = {}) {
        for (let field in _attributes) {
            let result = _attributes[field];

            // Create getter
            if (!this.hasAttribute(field) && !this[field]) {
                Object.defineProperty(this, field, {
                    get: () => this.getAttribute(field),
                    set: value => this.setAttribute(field, value)
                });
            }


            // Timestamps
            if (Arr.has(this.constructor.timestamps, field) && !(result instanceof DateTime)) {
                result = new DateTime(result);
            }

            this._attributes.set(field, _attributes[field]);
            this.setAttribute(field, _attributes[field]);

            this.sync();
        }
        return this;
    }

    /**
     * @returns {Model}
     */
    sync() {
        this._original = new Map;
        this._attributes.forEach((field, value) => {
            this._original.set(field, value);
        });
        return this;
    }

    /**
     * @returns {Model}
     */
    reset() {
        this._attributes = new Map;
        this._original.forEach((field, value) => {
            this._attributes.set(field, value);
        });
        return this;
    }

    /**
     * @returns {{}}
     */
    get dirty() {
        var dirty = {};
        this._attributes.forEach((field, value) => {
            if (!this._original.has(field) || this._original.get(field) !== value) {
                dirty[field] = this.getAttribute(field);
            }
        });
        return dirty;
    }

    /**
     * @returns {boolean}
     */
    isDirty() {
        return Object.keys(this.dirty) > 0;
    }

    /**
     * @param field
     * @returns {*}
     */
    getAttribute(field) {
        if (this.hasAttribute(field)) {
            return this._attributes.get(field);
        }

        return null;
    }

    /**
     * @param field
     * @param value
     * @returns {Model}
     */
    setAttribute(field, value) {
        if (this.hasAttribute(field)) {
            this.constructor.events.fire('updating', this, field, value);

            this._attributes.set(field, value);

            this.constructor.events.fire('updated', this, field, value);

            return this;
        }

        throw new ReferenceError(`Can not set new value. Model attribute ${this.constructor.name}.${field} not found`);
    }

    /**
     * @param field
     * @returns {boolean}
     */
    hasAttribute(field) {
        return this._attributes.has(field);
    }

    /**
     * Returns basic object with target fields
     *
     * @param field
     * @returns {{}}
     */
    only(...field) {
        var result = {};
        var data = this[toObject]();

        for (var i = 0; i < field.length; i++) {
            var key = field[i];
            result[key] = data[key];
        }

        return result;
    }

    /**
     * Returns basic object without target fields
     *
     * @param field
     * @returns {{}}
     */
    except(...field) {
        var result = {};
        var data = this[toObject]();

        for (var key in data) {
            if (!Arr.has(field, key)) {
                result[key] = data[key];
            }
        }

        return result;
    }

    /**
     * @returns {Model}
     */
    save() {
        if (this.isDirty()) {
            if (!this.constructor.events.fire('saving', this)) {
                return this;
            }

            this.sync();

            this.constructor.events.fire('saved', this);
        }

        return this;
    }

    /**
     * @returns {{}}
     */
    [toObject]() {
        var output = {};
        Obj.each(this._attributes, (k, v) => {
            output[k] = this._attributes.get(k);
        });
        return output;
    }
}
