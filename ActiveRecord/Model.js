import {bind} from "/Support/helpers";
import Serialize from "/Support/Serialize";
import Dispatcher from "/Events/Dispatcher";
import Collection from "/Support/Collection";

/**
 * Model
 */
export default class Model {
    /**
     * Event dispatchers collection WeakMap<Model, Dispatcher>
     *
     * @type {WeakMap}
     */
    static $events = new WeakMap();

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
            this.bootIfNotBooted();
        }
        return this.$booted.get(this);
    }

    /**
     * Take event dispatcher for target model
     *
     * @returns {Dispatcher}
     */
    static get events() {
        this.bootIfNotBooted();

        if (!this.$events.has(this)) {
            this.$events.set(this, new Dispatcher);
        }
        return this.$events.get(this);
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
            this.$booted.set(this, true);
            this.events;
            this.constructor();
        }
        return this;
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
    attributes = new Map();

    /**
     * @type {Map}
     */
    original = new Map();

    /**
     * @param attributes
     * @returns {Model}
     */
    static create(attributes = {}) {
        if (!(attributes = this.fire('creating', attributes))) {
            return this;
        }

        var result = new this(attributes);

        this.fire('created', result);

        return result;
    }


    /**
     * @param attributes
     */
    constructor(attributes = {}) {
        this.constructor.bootIfNotBooted();
        this.fill(attributes);
    }

    /**
     * @param attributes
     */
    fill(attributes = {}) {
        for (let field in attributes) {
            if (!this.hasAttribute(field) && !this[field]) {
                Object.defineProperty(this, field, {
                    get: () => this.getAttribute(field),
                    set: value => this.setAttribute(field, value)
                });
            }

            this.attributes.set(field, attributes[field]);
            this.setAttribute(field, attributes[field]);
            this.sync();
        }
        return this;
    }

    /**
     * @returns {Model}
     */
    sync() {
        this.original = new Map;
        this.attributes.forEach((field, value) => {
            this.original.set(field, value);
        });
        return this;
    }

    /**
     * @returns {Model}
     */
    reset() {
        this.attributes = new Map;
        this.original.forEach((field, value) => {
            this.attributes.set(field, value);
        });
        return this;
    }

    /**
     * @returns {{}}
     */
    get dirty() {
        var dirty = {};
        this.attributes.forEach((field, value) => {
            if (!this.original.has(field) || this.original.get(field) !== value) {
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
            return this.attributes.get(field);
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

            this.attributes.set(field, value);

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
        return this.attributes.has(field);
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

        this.attributes.forEach((value, field) => {
            result[field] = Serialize.toStructure(value);
        });

        return result;
    }
}
