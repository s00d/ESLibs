import Ajax from "/Request/Ajax";
import Obj from "/Support/Std/Obj";
import Inject from "/Container/Inject";
import Model from "/ActiveRecord/Model";
import Collection from "/Support/Collection";
import {toObject} from "/Support/Interfaces/Serializable";

/**
 *
 */
class RepositoryResponse {
    /**
     * @type {null|Model}
     * @private
     */
    _model = null;

    /**
     * @type {{}|[]}
     * @private
     */
    _response = {};

    /**
     * @param model
     * @param response
     */
    constructor(model:Model, response) {
        this._model = model;
        this._response = response;
    }

    /**
     * @returns {Collection}
     */
    toCollection() {
        var result = new Collection([]);
        var items  = this.toArray();
        for (var i = 0; i < items.length; i++) {
            result.push(this._model.create(items[i]));
        }
        return result;
    }

    /**
     * @returns {Model}
     */
    toModel() {
        return this._model.create(this.response);
    }

    /**
     * @returns {[]}
     */
    toArray() {
        if (this._response instanceof Array) {
            return this._response;
        }
        return [this._response];
    }

    /**
     * @returns {{}|*[]}
     */
    get response() {
        return this._response;
    }

    /**
     * @returns {string}
     */
    toString() {
        return JSON.stringify(this.response);
    }
}

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
     * @param {Model} model
     * @param {object} routes
     */
    constructor(model:Model, routes = {}) {
        this.model = model;
        this.setRoutes(routes);
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
        return (await this.request('show', args)).toModel();
    }

    /**
     * @param args
     * @returns {Collection|Array[]|Model[]}
     */
    async index(args = {}) {
        return (await this.request('index', args)).toCollection();
    }

    /**
     * @param model
     * @param args
     * @returns {RepositoryResponse}
     */
    async save(model:Model, args = {}) {
        return this.saveData(Obj.merge(model[toObject](), args));
    }

    /**
     * @param args
     * @returns {RepositoryResponse}
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
        return this.destroyData(Obj.merge(model[toObject](), args));
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
     * @returns {RepositoryResponse}
     */
    async request(route, args = {}, options = {}) {
        var ajax       = App.make('ajax');
        var data       = this.getRoute(route);
        options.method = data.method || 'get';

        
        var result = await (await ajax.request(data.url, args, options)).json();



        return new RepositoryResponse(this.model, result);
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
