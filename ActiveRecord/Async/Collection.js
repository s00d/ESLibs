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
    static $storage = new Map();

    /**
     * Returns storage adapter
     * @returns {AbstractAdapter}
     */
    static get storage() {
        if (!this.$storage.has(this)) {
            this.storage = new MemoryAdapter;
            this.bootIfNotBooted();
        }
        return this.$storage.get(this);
    }

    /**
     * Setting new storage adapter
     * @param {AbstractAdapter} adapter
     */
    static set storage(adapter:AbstractAdapter) {
        adapter.prefix = `model:${this.name.toLowerCase()}:`;
        this.$storage.set(this, new Repository(adapter))
    }

    /**
     * @type {null}
     */
    static ajax = null;

    /**
     * @param adapter
     * @returns {Collection}
     */
    static setAjaxAdapter(adapter) {
        this.ajax = adapter;
        return this;
    }

    /**
     * @returns {Ajax}
     */
    static getAjaxAdapter() {
        return this.ajax;
    }

    /**
     * @type {{index: string, get: string, update: string, delete: string}}
     */
    static routes = {
        index:  '/all.json',

        get:    '/get/{id}.json',
        update: '/save/{id}.json',
        delete: '/delete/{id}.json'
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
            throw new Error(`Route ${name} not defined in ${this.name}.`);
        }

        Object.keys(args).forEach(key => {
            var value = args[key];
            route = route.replace(`{${key}}`, Serialize.toString(value));
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
        var start = (new Date).getTime();


        this.bootIfNotBooted();
        this.fire('loading', this);

        var result = await this.request('index', 'get', {}, options);

        console.log(this.name + ' loaded at ' + ((new Date).getTime() - start) + 'ms');
        start = (new Date).getTime();

        for (var i = 0; i < result.length; i++) {
            var b = (new Date).getTime();
            this.create(result[i]);
            console.log(this.name + ' created at ' + ((new Date).getTime() - b) + 'ms');
        }

        console.log(this.name + ' ALL CREATED === ' + ((new Date).getTime() - start) + 'ms');

        this.fire('loaded', this);

        return this;
    }

    /**
     * @param route
     * @param method
     * @param args
     * @param options
     * @param cache
     * @returns {{saveUp: number, value: Object}}
     */
    static async request(route, method, args = {}, options = {}, cache = true) {
        var ajax    = Collection.getAjaxAdapter();

        try {
            route        = this.routeTo(route, args);

            if (!this.storage.has(route) || !cache) {
                var response = await ajax[method](route, {}, options);
                var json     = await response.json();
                var result   = this.getResponse(json);

                this.storage.set(route, result);
            }

            return cache ? this.storage.get(route) : result;

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


    async save() {
        // @TODO
    }
}
