import Container from "/Container/Container";
import ServiceProvider from "/Container/ServiceProvider";

/**
 * Application facade
 */
export default class Facade extends Container {
    /**
     * @type {Facade}
     */
    static instance = null;

    /**
     * @type {boolean}
     */
    static booted = false;

    /**
     * @type {Array}
     */
    static providers = [];

    /**
     * @param providerClass
     * @returns {Container}
     */
    static registerServiceProvider(providerClass:ServiceProvider) {
        var application = this.getInstance();

        this.booted
            ? application.resolve(providerClass).boot()
            : this.providers.push(providerClass);

        return this;
    }

    /**
     * @returns {Facade}
     */
    static getInstance() {
        if (this.instance === null) {
            this.instance                   = new this;
            this.instance.resolved['app']   = this.instance;
        }
        return this.instance;
    }

    /**
     * @returns {Facade}
     */
    static create() {
        var application = this.getInstance();

        if (!this.booted) {
            var cls = null;
            while (cls = this.providers.shift()) {
                application.resolve(cls).boot();
            }
        }

        this.booted = true;

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
