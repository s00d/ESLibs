import Facade from "/Container/Facade";
import Inject from "/Container/Inject";
import Dispatcher from "/Events/Dispatcher";
import OptionsBuilder from "/Request/OptionsBuilder";

/**
 *
 */
export default class Ajax {
    /**
     * @type {null|string}
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
     * @param {Facade} app
     * @param {string} url
     * @param {{}} args
     * @param {{}} options
     * @returns {Response|null}
     */
    @Inject('app')
    async request(app:Facade, url, args = {}, options = {}) {
        if (!this.events.fire('prepare', url, args, options)) {
            return null;
        }

        (url.split('?')[1] || '').split('&').forEach(insideArg => {
            var [key, value] = insideArg.split('=');
            args[key] = value;
        });
        url = url.split('?')[0];

        options.redirect = 'manual';

        // Pattern matching
        Object.keys(args).forEach(key => {
            url = url.replace('{' + key + '}', args[key]);
        });

        var builder = (new OptionsBuilder(url, args, options))
                .addCsrf(Ajax.getCsrfToken());


        var fetchOptions    = builder.getOptions();

        var fetchUrl        = builder.getUrl();

        if (!this.events.fire('before', fetchUrl, fetchOptions)) {
            return null;
        }

        try {
            var result = await fetch(fetchUrl, fetchOptions);
        } catch (e) {
            throw new Error(`Error while fetching ${fetchUrl}`, 500, e);
        }

        if (result.status >= 400) {
            this.events.fire('error', result);
            throw new Error(result.statusText, result.status);
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
