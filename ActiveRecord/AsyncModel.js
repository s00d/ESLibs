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
     * @returns {null}
     */
    static getAjaxAdapter() {
        return this.ajax;
    }

    /**
     * @type {{load: string}}
     */
    static request = {
        load: ''
    };

    /**
     * @param name
     * @returns {*}
     */
    static getRoute(name) {
        var ajax = AsyncModel.getAjaxAdapter();
        if (!ajax) {
            throw new Error('Ajax adapter not defined');
        }

        var route = this.request[name];
        if (!route) {
            throw new Error(`Route ${name} not defined in ${this.name}.`);
        }

        return route;
    }

    /**
     * @param flush
     * @param title
     * @returns {AsyncModel}
     * @throws Error
     */
    static async load(flush = true, title = null) {
        this.bootIfNotBooted();
        this.dispatcher.fire('loading', this);
        var result = [];

        try {
            var route       = this.getRoute('load');
            var ajax        = AsyncModel.getAjaxAdapter();
            var response    = await (
                await ajax.get(route, {}, {title: title})
            ).json();

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

    /**
     * @param title
     */
    async save(title = null) {
        var route = this.constructor.getRoute('save');
        var ajax  = AsyncModel.getAjaxAdapter();

        try {
            if (this.dirty()) {
                var result = await (
                    await ajax.post(route, this.attributes, {title: title})
                ).json();
            }

        } catch (e) {
            console.error(`Can not save ${this.constructor.name}@save[${route}]: ${e} \n${e.stack}`);
        }

        super.save();
    }
}
