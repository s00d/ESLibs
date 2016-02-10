import Ajax from "/Request/Ajax";
import Inject from "/Container/Inject";
import Model from "/ActiveRecord/Model";
import Collection from "/Support/Collection";
import MemoryAdapter from "/Storage/Adapters/MemoryAdapter";
import {default as Storage} from "/Storage/Repository";

/**
 *
 */
export default class Repository {
    /**
     * @type {WeakMap<Function, Repository>|WeakMap}
     */
    static repositories = new WeakMap();

    /**
     * @param callback
     * @returns {Repository|V}
     */
    static cached(callback:Function) {
        if (!this.repositories.has(this)) {
            this.repositories.set(this, callback());
        }
        return this.repositories.get(this);
    }

    /**
     * @type {null|Model}
     */
    model = null;

    /**
     * @type {{index: {url: string, method: string}, show: {url: string, method: string}, update: {url: string, method: string}, destroy: {url: string, method: string}}}
     */
    routes = {
        index:   {url: '/index.json', method: 'get'},
        show:    {url: '/{id}.json', method: 'get'},
        update:  {url: '/{id}.json', method: 'post'},
        destroy: {url: '/{id}.json', method: 'delete'}
    };

    /**
     * @type {Storage}
     */
    storage = null;

    /**
     * @param {Model} model
     * @param {object} routes
     */
    constructor(model:Model, routes = {}) {
        this.model = model;
        this.setRoutes(routes);
    }

    /**
     * @returns {Storage}
     */
    getStorage() {
        if (this.storage === null) {
            this.storage = new Storage(new MemoryAdapter(`${this.model.name}:`));
        }
        return this.storage;
    }

    /**
     * @param {Storage} storage
     * @returns {Repository}
     */
    setStorage(storage:Storage) {
        this.storage = storage;
        return this;
    }

    /**
     * @param {Model} model
     * @returns {Repository}
     */
    setModel(model:Model) {
        this.model = model;
        return this;
    }

    /**
     * @returns {null|Model}
     */
    getModel() {
        return this.model;
    }

    /**
     * @param {Object} routes
     * @returns {Repository}
     */
    setRoutes(routes:Object) {
        Object.keys(routes).forEach(name => {
            var route = routes[name];
            if (typeof route === 'object') {
                this.setRoute(name, route.url, route.method);
            } else {
                this.setRoute(name, route);
            }
        });

        return this;
    }

    /**
     * @param {String} name
     * @param {String} url
     * @param {String} method
     * @returns {Repository}
     */
    setRoute(name, url, method = 'get') {
        this.routes[name] = {url: url, method: method};
        return this;
    }

    /**
     * @param name
     * @returns {*|{url: string, method: string}}
     */
    getRoute(name) {
        return this.routes[name] || {url: '/undefined.json', method: 'get'};
    }

    /**
     * @param args
     * @returns {Model}
     */
    async get(args = {}) {
        return this.model.create(await this.request('show', args));
    }

    /**
     * @param args
     * @returns {Collection|Array[]|Model[]}
     */
    async index(args = {}) {
        var response = new Collection();
        var items    = await this.request('index', args);
        for (var i = 0; i < items.length; i++) {
            response.push(this.model.create(items[i]));
        }

        return response;
    }

    /**
     * @param model
     * @param args
     */
    async save(model:Model, args = {}) {
        return this.saveData(
            Repository._mergeObjects(model.toObject(), args)
        );
    }

    /**
     * @param args
     * @returns {*}
     */
    async saveData(args = {}) {
        return await this.request('update', args);
    }

    /**
     * @param model
     * @param args
     * @returns {*}
     */
    async destroy(model:Model, args = {}) {
        return this.destroyData(
            Repository._mergeObjects(model.toObject(), args)
        );
    }

    /**
     * @param args
     * @returns {*}
     */
    async destroyData(args = {}) {
        return await this.request('destroy', args);
    }

    /**
     * @param route
     * @param args
     * @param options
     * @returns {*}
     */
    async request(route, args = {}, options = {}) {
        var storage    = this.getStorage();
        var ajax       = App.make('ajax');
        var data       = this.getRoute(route);
        var key        = `${route}/${args.id || JSON.stringify(args)}`;
        options.method = data.method || 'get';

        if (options.method !== 'get') {
            storage.clear();
            return await (await ajax.request(data.url, args, options)).json();
        }

        if (!storage.has(key)) {
            var result = await (await ajax.request(data.url, args, options)).json();
            storage.set(key, result);
        }

        return storage.get(key);
    }

    /**
     * @param {Object} source
     * @param {Object} instance
     * @returns {*}
     * @private
     */
    static _mergeObjects(source, instance) {
        source = JSON.parse(JSON.stringify(source));

        Object.keys(instance).forEach(key => {
            source[key] = instance[key];
        });

        return source;
    }
}
