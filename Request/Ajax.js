import Config from "/App/Config";
import Facade from "/Container/Facade";
import Inject from "/Container/Inject";
import Dispatcher from "/Events/Dispatcher";
import OptionsBuilder from "/Request/OptionsBuilder";

/**
 *
 */
export default class Ajax {
    /**
     * @type {null}
     */
    static csrf = null;

    /**
     * @param token
     * @returns {Ajax}
     */
    static setCsrfToken(token) {
        this.csrf = token;
        return this;
    }

    /**
     * @returns {string}
     */
    static getCsrfToken() {
        return this.csrf;
    }

    /**
     * @type {Dispatcher}
     */
    events = new Dispatcher;

    /**
     * @type {null|string}
     */
    csrf = null;

    /**
     * @constructor
     */
    constructor() {
        this.csrf = this.constructor.getCsrfToken();
    }

    /**
     * @param {Facade} app
     * @param {string} url
     * @param {{}} args
     * @param {{}} options
     * @returns {*}
     */
    @Inject('app')
    async request(app:Facade, url, args = {}, options = {}) {
        this.events.fire('prepare', url, args, options);

        var builder =
                (new OptionsBuilder(url, args, options))
                .addCsrf(this.csrf);

        var fetchOptions    = builder.getOptions();
        var fetchUrl        = builder.getUrl();

        this.events.fire('before', fetchUrl, fetchOptions);

        try {
            var result = await fetch(fetchUrl, fetchOptions);
        } catch (e) {
            console.error(e);
        }

        if (result.status >= 400) {
            this.events.fire('error', result);
            throw new Error(result.statusText);
        }

        this.events.fire('after', result);

        return result;
    }

    /**
     * @param callback
     * @returns {Ajax}
     */
    before(callback:Function) {
        this.events.listen('before', callback);
        return this;
    }

    /**
     * @param callback
     * @returns {Ajax}
     */
    prepare(callback:Function) {
        this.events.listen('prepare', callback);
        return this;
    }

    /**
     * @param callback
     * @returns {Ajax}
     */
    error(callback:Function) {
        this.events.listen('error', callback);
        return this;
    }

    /**
     * @param callback
     * @returns {Ajax}
     */
    after(callback:Function) {
        this.events.listen('after', callback);
        return this;
    }

    /**
     * @param url
     * @param args
     * @param options
     * @returns {*}
     */
    async get(url, args = {}, options = {}) {
        options.method = 'get';
        return await this.request(url, args, options);
    }

    /**
     * @param url
     * @param args
     * @param options
     * @returns {*}
     */
    async post(url, args = {}, options = {}) {
        options.method = 'post';

        return await this.request(url, args, options);
    }
}
