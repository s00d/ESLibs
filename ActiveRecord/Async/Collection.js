import Ajax from "/Request/Ajax";
import Serialize from "/Support/Serialize";
import Repository from "/Storage/Repository";
import MemoryAdapter from "/Storage/Adapters/MemoryAdapter";
import AbstractAdapter from "/Storage/Adapters/AbstractAdapter";
import {default as BaseCollection} from "/ActiveRecord/Collection";

/**
 *
 */
export default class Collection extends BaseCollection {
    /**
     * @type {Map}
     */
    static _dependsOn = new Map();

    /**
     * @returns {[]}
     */
    static get dependsOn() {
        if (!this._dependsOn.has(this)) {
            this._dependsOn.set(this, []);
            this.bootIfNotBooted();
        }
        return this._dependsOn.get(this);
    }

    /**
     * @param value
     */
    static set dependsOn(value:Array) {
        this._dependsOn.set(this, value);
    }

    /**
     * @type {Map<{adapter: AbstractAdapter, lazyLoadTimeout: Number, rememberTimeout: Number}>}
     */
    static _storage = new Map();

    /**
     * Returns storage adapter
     * @returns {{adapter: AbstractAdapter, lazyLoadTimeout: Number, rememberTimeout: Number}}
     */
    static get storage() {
        if (!this._storage.has(this)) {
            this._storage.set(this, {
                adapter:         new Repository(
                    new MemoryAdapter(
                        `model:${this.name.toLowerCase()}`
                    )
                ),
                lazyLoadTimeout: 1000,
                rememberTimeout: 3600000 // 3600000 == 1 hour
            });
            this.bootIfNotBooted();
        }

        return this._storage.get(this);
    }

    /**
     * Setting new storage adapter
     * @param {AbstractAdapter} adapter
     * @returns {Collection}
     */
    static setStorageAdapter(adapter:AbstractAdapter) {
        adapter.prefix = `model:${this.name.toLowerCase()}`;
        this.storage.adapter = new Repository(adapter);

        return this;
    }

    /**
     * Setting new lazy load timeout
     * @param timeout
     * @returns {Collection}
     */
    static setStorageLazyLoadTimeout(timeout) {
        this.storage.lazyLoadTimeout = timeout;

        return this;
    }

    /**
     * Setting new lazy load timeout
     * @param timeout
     * @returns {Collection}
     */
    static setStorageRememberTimeout(timeout) {
        this.storage.rememberTimeout = timeout;

        return this;
    }

    /**
     * @type {null}
     */
    static _ajax = null;

    /**
     * @param adapter
     * @returns {Collection}
     */
    static setAjaxAdapter(adapter) {
        this._ajax = adapter;
        return this;
    }

    /**
     * @returns {Ajax}
     */
    static getAjaxAdapter() {
        return this._ajax;
    }

    /**
     * @type {{index: string, get: string, update: string, delete: string}}
     */
    static routes = {
        index:  `{name}s.json`,
        get:    `{name}/{id}.json`,
        update: `{name}/{id}/save.json`,
        delete: `{name}/{id}/delete.json`
    };

    /**
     * @param name
     * @param args
     * @returns {*}
     */
    static routeTo(name, args = {}) {
        var ajax = Collection.getAjaxAdapter();
        if (!ajax) {
            throw new Error('Ajax adapter not defined');
        }

        var route = this.routes[name];
        if (!route) {
            if (Collection.routes[name]) {
                route = Collection.routes[name];
            } else {
                throw new Error(`Route ${name} not defined in ${this.name}.`);
            }
        }

        route = route.replace(`{name}`, this.name.toLowerCase());
        Object.keys(args).forEach(key => {
            var value = args[key];
            route     = route.replace(`{${key}}`, Serialize.toString(value));
        });

        return route;
    }

    /**
     * Unwrap response
     *
     * @param response
     * @returns {*}
     */
    static getResponse(response) {
        if (response.result) {
            return response.result;
        } else {
            throw new Error('JsonRpc format error.', -32700);
        }
    }

    /**
     * Reload all items
     *
     * @returns {*}
     */
    static async reload() {
        this.collection.remove(i => true);
        return this.load();
    }

    /**
     * Load items
     *
     * @param options
     * @returns {Collection}
     */
    static async load(options = {}) {
        var i = 0;

        this.bootIfNotBooted();
        this.fire('loading', this);


        // Load dependencies
        for (i = 0; i < this.dependsOn.length; i++) {
            await this.dependsOn[i].load();
        }

        var result = await this.request('index', 'get', {}, options);

        for (i = 0; i < result.length; i++) {
            this.create(result[i]);
        }


        this.fire('loaded', this);

        return this;
    }

    /**
     * @param route
     * @param method
     * @param args
     * @param options
     * @param cachedRequest
     * @returns {{saveUp: number, value: Object}}
     */
    static async request(route, method, args = {}, options = {}, cachedRequest = true) {
        var ajax    = Collection.getAjaxAdapter();
        var storage = this.storage.adapter;

        try {
            route = this.routeTo(route, args);

            /**
             * Get data
             * @returns {*}
             */
            var updateStorageData  = async (route, method, args, options) => {
                var response = await ajax[method](route, args, options);
                var json     = await response.json();
                var result   = this.getResponse(json);

                storage.set(route, result, this.storage.rememberTimeout);

                return result;
            };

            if (!cachedRequest || !storage.has(route)) {
                // Synchronized update
                await updateStorageData(route, method, args, options);

            } else if (this.storage.lazyLoadTimeout > 0) {

                // Lazy update
                setTimeout(
                    () => updateStorageData(route, method, args, options),
                    this.storage.lazyLoadTimeout
                );
            }

            return storage.get(route);

        } catch (e) {

            console.error(e);
        }
    }

    /**
     * @param options
     * @returns {*}
     */
    async get(options = {}) {
        var attributes = await this.constructor.request('get', 'get', this.toObject(), options);

        if (this.saved) {
            return new this.constructor(attributes);
        }
        return this.constructor.create(attributes);
    }


    /**
     * @param options
     */
    async save(options = {}) {
        var storage   = this.constructor.storage.adapter;

        // Clear storage
        var data      = this.toObject();

        storage.remove(this.constructor.routeTo('index', data));
        storage.remove(this.constructor.routeTo('get', data));
        storage.remove(this.constructor.routeTo('update', data));

        var result = await this.constructor.request('update', 'post', data, options, false);

        super.save();

        return result;
    }
}
