import Arr from "/Support/Arr";
import Carbon from "/Carbon/Carbon";
import {bind} from "/Support/helpers";
import Serialize from "/Support/Serialize";
import Dispatcher from "/Events/Dispatcher";
import Collection from "/Support/Collection";

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
        if (!(attributes = this.fire('creating', attributes))) {
            return this;
        }

        var instance = new this(attributes);

        this.fire('created', instance);

        return instance;
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
        this.fill(_attributes);
    }

    /**
     * @param _attributes
     */
    fill(_attributes = {}) {
        for (let field in _attributes) {
            if (!this.hasAttribute(field) && !this[field]) {
                Object.defineProperty(this, field, {
                    get: () => this.getAttribute(field),
                    set: value => this.setAttribute(field, value)
                });
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
            var result = this._attributes.get(field);

            // Timestamps
            if (Arr.has(this.constructor.timestamps, field) && !(result instanceof Carbon)) {
                result = Carbon.parse(result);

                this._attributes.set(field, result);
                this._original.set(field, result);
            }

            return result;
        }
        return null;
    }

    /**
     * @param field
     * @param value
     * @returns {Model}
     */
    setAttribute(field, value) {
        var result = [field, value];
        var _$ = this;

        if (this.hasAttribute(field)) {
            if (!(result = this.constructor.events.fire('updating', this, field, value))) {
                return this;
            }
            [_$, field, value] = result;

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
        var data = this.toObject();

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
        var data = this.toObject();

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
    toObject() {
        var result = {};

        this._attributes.forEach((value, field) => {
            result[field] = Serialize.toStructure(value);
        });

        return result;
    }
}
