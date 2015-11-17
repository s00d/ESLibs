import Dispatcher from "/Events/Dispatcher";
import EventObject from "/Events/EventObject";

/**
 * Items collection
 */
export default class Collection {
    static E_ADD    = 'add';
    static E_REMOVE = 'remove';
    static E_CHANGE = 'change';

    /**
     * @type {Array}
     */
    elements = [];

    /**
     * @type {Dispatcher}
     */
    events = new Dispatcher();

    /**
     * @param elements
     * @param dispatcher
     */
    constructor(elements = [], dispatcher:Dispatcher = null) {
        this.events = dispatcher || this.events;


        this.events.listen(this.constructor.E_ADD, () => {
            this.events.fire(this.constructor.E_CHANGE, this.elements);
        });

        this.events.listen(this.constructor.E_REMOVE, () => {
            this.events.fire(this.constructor.E_CHANGE, this.elements);
        });

        for (var i = 0; i < elements.length; i++) {
            this.push(elements[i]);
        }
    }

    /**
     * @param event
     * @param callback
     * @returns {EventObject}
     */
    on(event, callback:Function) {
        return this.events.listen(event, callback);
    }

    /**
     * @param event
     * @returns {Dispatcher}
     */
    off(event:EventObject) {
        return event.remove();
    }

    /**
     * @param event
     * @param callback
     * @returns {Event}
     */
    once(event, callback:Function) {
        return this.on(event, callback).once();
    }

    /**
     * @param item
     * @returns {Collection}
     */
    push(item) {
        this.elements.push(item);
        this.events.fire(this.constructor.E_ADD, item);
        return this;
    }

    /**
     * @param item
     * @returns {Collection}
     */
    unshift(item) {
        this.elements.unshift(item);
        this.events.fire(this.constructor.E_ADD, item);
        return this;
    }

    /**
     * @returns {Collection}
     */
    pop() {
        var item = this.elements.pop();
        this.events.fire(this.constructor.E_REMOVE, item);
        return item;
    }

    /**
     * @returns {Collection}
     */
    shift() {
        var item = this.elements.shift();
        this.events.fire(this.constructor.E_REMOVE, item);
        return item;
    }

    /**
     * @param callback
     * @returns {Collection}
     */
    remove(callback:Function) {
        var items = [];
        var removed = [];
        var i = 0;

        for (i = 0; i < this.elements.length; i++) {
            if (!callback(this.elements[i])) {
                items.push(this.elements[i]);
            } else {
                removed.push(this.elements[i]);
            }
        }

        this.elements = items;

        for (i = 0; i < removed.length; i++) {
            this.events.fire(this.constructor.E_REMOVE, removed[i]);
        }

        return this;
    }

    /**
     * @param callback
     * @returns {Collection}
     */
    find(callback:Function) {
        var items = [];
        for (var i = 0; i < this.elements.length; i++) {
            if (callback(this.elements[i])) {
                items.push(this.elements[i]);
            }
        }
        return new this.constructor(items);
    }

    /**
     * @returns {*}
     */
    random() {
        return this.elements[
            Math.floor(Math.random() * this.length)
        ];
    }

    /**
     * @param key
     * @param op
     * @param value
     * @returns {Collection}
     */
    where(key, op, value) {
        if (typeof op === 'undefined') {
            op    = '=';
            value = true;
        } else if (typeof value === 'undefined') {
            value = op;
            op    = '=';
        }

        return this.find(item => {
            var original = item[key];
            if (typeof original === 'function') {
                original = original.apply(item, []);
            }
            switch (op) {
                case '>':
                    return original > value;
                case '<':
                    return original < value;
                case '>=':
                    return original >= value;
                case '<=':
                    return original <= value;
                case '<>':
                case '!=':
                    return original != value;
                default:
                    return original == value;
            }
        });
    }

    /**
     * @param callback
     * @param order
     * @return {Collection}
     */
    sort(callback:Function, order = 1) {
        switch (order.toString().toLowerCase()) {
            case 'asc':
                order = 1;
                break;
            case 'desc':
                order = -1;
                break;
        }

        order = order > 0
            ? 1
            : -1;

        return new this.constructor(this.elements.sort((a, b) => {
            a = callback(a);
            b = callback(b);
            if (a === b) {
                return 0;
            }
            return a > b
                ? order
                : -order;
        }));
    }

    /**
     * @param callback
     * @returns {Collection}
     */
    each(callback:Function) {
        for (var i = 0; i < this.elements.length; i++) {
            callback(this.elements[i]);
        }
        return this;
    }

    /**
     * @param callback
     * @returns {Collection}
     */
    map(callback:Function) {
        return new this.constructor(this.elements.map(item => callback(item)));
    }

    /**
     * @param delimiter
     * @param property
     * @returns {*}
     */
    join(delimiter = ', ', property = null) {
        if (this.length > 0) {
            var items = this.elements.map(item => {
                if (property) {
                    return item[property]
                        ? item[property].toString()
                        : '';
                }
                return item.toString();
            });

            return items.join(delimiter);
        }

        return '';
    }

    /**
     * @param count
     * @returns {Collection}
     */
    take(count = 1) {
        return new this.constructor(this.elements.slice(0, count));
    }

    /**
     * @param field
     * @param order
     * @returns {Collection}
     */
    orderBy(field, order = 1) {
        return this.sort(item => item[field], order);
    }

    /**
     * @param shift
     * @returns {*}
     */
    first(shift = 0) {
        if (this.elements.length > 0) {
            return this.elements.slice(shift, 1)[0];
        }
        return null;
    }

    /**
     * @returns {Collection}
     */
    clear() {
        this.elements = [];
        return this;
    }

    /**
     * @returns {Collection}
     */
    clone() {
        return new this.constructor(this.all());
    }

    /**
     * @returns {Array}
     */
    all() {
        return this.elements.slice(0);
    }

    /**
     * @param target
     * @returns {Array}
     */
    toArray(target = null) {
        var result = this.all();
        if (target instanceof Function) {
            target(result);
        }
        return result;
    }

    /**
     * @returns {Number}
     */
    get length() {
        return this.elements.length;
    }

    /**
     * @returns {Generator}
     */
    *[Symbol.iterator]() {
        for (var i = 0; i < this.elements.length; i++) {
            yield this.elements[i];
        }
    }
}
