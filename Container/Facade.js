import Container from "/Container/Container";
import ServiceProvider from "/Container/ServiceProvider";

/**
 * Application facade
 */
export default class Facade extends Container {
    /**
     * @type {Facade}
     */
    static _instance = null;

    /**
     * @type {boolean}
     */
    static _booted = false;

    /**
     * @type {Array}
     */
    static _providers = [];

    /**
     * @param providerClass
     * @returns {Container}
     */
    static registerServiceProvider(providerClass:ServiceProvider) {
        var application = this.getInstance();

        var provider = application.resolve(providerClass);
        provider.register();

        if (this._booted) {
            provider.boot();

        } else {

            this._providers.push(providerClass);
        }

        return this;
    }

    /**
     * @returns {Facade}
     */
    static getInstance() {
        if (this._instance === null) {
            this._instance                   = new this;
            this._instance._resolved['app']  = this._instance;
        }
        return this._instance;
    }

    /**
     * @returns {Facade}
     */
    static create() {
        var application = this.getInstance();

        if (!this._booted) {
            var cls = null;
            while (cls = this._providers.shift()) {
                application.resolve(cls).boot();
            }
        }

        this._booted = true;

        return application;
    }

    /**
     * @param alias
     * @param target
     * @returns {Container}
     */
    static bind(alias:String, target:Function) {
        return this.getInstance().bind(alias, target);
    }

    /**
     * @param alias
     * @param callback
     * @returns {Container}
     */
    static singleton(alias:String, callback:Function) {
        return this.getInstance().singleton(alias, callback);
    }

    /**
     * @param alias
     * @param args
     * @returns {*}
     */
    static make(alias:String, ...args) {
        return this.getInstance().make(alias, ...args);
    }

    /**
     * @param cls
     * @param args
     * @returns {*}
     */
    static resolve(cls:Function, ...args) {
        return this.getInstance().resolve(cls, ...args);
    }
}
