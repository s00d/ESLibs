/**
 * Request optiosn builder
 */
export default class OptionsBuilder {
    /**
     * @type {{get: boolean, head: boolean}}
     */
    static GET_METHODS = {get:true, head:true};

    /**
     * @type {string}
     */
    url = '/';

    /**
     * @type {FormData}
     */
    args = {};

    /**
     * @type {{}}
     */
    options = {};

    /**
     * @param url
     * @param args
     * @param options
     */
    constructor(url, args = {}, options = {}) {
        this.url     = url;
        this.args    = args;

        this.options = {
            method:         (options.method || 'get').toLocaleLowerCase(),
            headers:        new Headers(options.headers || {}),
            credentials:    (options.credentials || 'same-origin'),
            redirect:       (options.redirect || 'follow'),
            body:           (options.body || null)
        };
    }

    /**
     * @param token
     * @returns {OptionsBuilder}
     */
    addCsrf(token) {
        this.args._token = token;
        this.options.headers.append('X-XSRF-Token', token);

        return this;
    }

    /**
     * @returns {{}}
     */
    getOptions() {
        // If json
        if (this.url.search('.json')) {
            this.options.headers.append('Accept', 'application/json');
            this.options.headers.append('Content-Type', 'application/json');

            if (!OptionsBuilder.GET_METHODS[this.options.method]) {
                this.options.body = (this.options.body || JSON.stringify(this.args));
            }

        // If not get
        } else if (!OptionsBuilder.GET_METHODS[this.options.method]) {

            this.options.body = (this.options.body || this.buildUrlArgs());
        }

        return this.options;
    }

    /**
     * @returns {string}
     */
    getUrl() {
        if (OptionsBuilder.GET_METHODS[this.options.method]) {
            return this.url + `?${this.buildUrlArgs()}`;
        }
        return this.url;
    }

    /**
     * @returns {string}
     */
    buildUrlArgs() {
        var result = '';
        for (var key in this.args) {
            result += `${encodeURIComponent(key)}=${encodeURIComponent(this.args[key])}&`;
        }
        return result.substr(0, result.length - 1);
    }
}
