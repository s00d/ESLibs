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
}
