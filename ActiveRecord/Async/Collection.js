import Ajax from "/Request/Ajax";
import Serialize from "/Support/Serialize";
import {default as BaseCollection} from "/ActiveRecord/Collection";

/**
 *
 */
export default class Collection extends BaseCollection {
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
     * @returns {*}
     */
    static getRoute(name) {
        var ajax = Collection.getAjaxAdapter();
        if (!ajax) {
            throw new Error('Ajax adapter not defined');
        }

        var route = this.routes[name];
        if (!route) {
            throw new Error(`Route ${name} not defined in ${this.name}.`);
        }

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
        this.bootIfNotBooted();
        this.fire('loading', this);

        var result = await this.request('index', 'get', {}, options);

        result.forEach(item => { this.create(item); });

        this.fire('loaded', this);

        return this;
    }

    /**
     *
     * @param route
     * @param method
     * @param args
     * @param options
     * @returns {*}
     */
    static async request(route, method, args = {}, options = {}) {
        try {
            route    = this.getRoute(route);

            Object.keys(args).forEach(key => {
                var value = args[key];
                route = route.replace(`{${key}}`, Serialize.toString(value));
            });

            var ajax     = Collection.getAjaxAdapter();

            var response = await (
                await ajax[method](route, {}, options)
            ).json();

            return this.getResponse(response);

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
