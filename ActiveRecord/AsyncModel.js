import Model from "/ActiveRecord/Model";

/**
 *
 */
export default class AsyncModel extends Model {
    /**
     * @type {null}
     */
    static ajax = null;

    /**
     * @param adapter
     * @returns {AsyncModel}
     */
    static setAjaxAdapter(adapter) {
        this.ajax = adapter;
        return this;
    }

    /**
     * @type {{load: string}}
     */
    static request = {
        load: ''
    };

    /**
     * @param request
     * @param flush
     * @param title
     * @returns {AsyncModel}
     * @throws Error
     */
    static async load(request = 'load', flush = true, title = null) {
        this.bootIfNotBooted();
        this.dispatcher.fire('loading', this);
        var result = [];

        try {
            if (!this.ajax) {
                throw new Error('Ajax driver not defined');
            }
            var response = await (await this.ajax.get(this.request[request], {}, {
                title: title
            })).json();

            if (response.result) {
                result = response.result;

            } else {

                throw new Error('JsonRpc format error.');
            }

        } catch (e) {

            console.error(`Can not load ${this.name}@load[${this.request[request]}]: ${e} \n${e.stack}`);
        }

        if (flush) { this.collection.remove(i => true); }

        result.forEach(item => { this.create(item); });

        this.dispatcher.fire('loaded', this);

        return this;
    }
}
