import {VIEW} from "/View/View";
import Inject from "/Container/Inject";
import Dispatcher from "/Events/Dispatcher";

/**
 * View container
 */
export default class Container {
    /**
     * @type {Dispatcher}
     * @private
     */
    _dispatcher = new Dispatcher;

    /**
     * @type {{}}
     * @private
     */
    _controllers = {};

    constructor() {
        this._dispatcher.listen('*', (e) => {
            console.log(e);
        })
    }

    /**
     * @param controller
     * @returns {*}
     */
    register(controller) {
        this.injectGlobalFields(controller);

        var aliases = controller[VIEW]
            ? controller[VIEW]
            : [controller.name];

        for (var i = 0; i < aliases.length; i++) {
            this._controllers[aliases[i]] = controller;
        }

        return this;
    }

    /**
     * @param app
     * @param controller
     * @returns {Container}
     */
    @Inject('app')
    injectGlobalFields(app, controller) {
        controller.prototype.app = app;
        //controller.prototype.container = this;

        return this;
    }


    /**
     * @returns {*|void}
     */
    @Inject('app')
    make(app) {
        [].slice.call(document.querySelectorAll('[view-model]'), 0).forEach(node => {
            var name = node.getAttribute('view-model');
            var controller = this._controllers[name];
            var instance   = app.resolve(controller, app);

            this.injectInstanceFields(instance, name);

            ko.applyBindings(instance, node);
        });
    }

    /**
     * @param instance
     * @param alias
     */
    injectInstanceFields(instance, alias) {
        instance.fire = (event, ...args) => {
            return this._dispatcher.fire(`${alias}:${event}`, ...args);
        };

        instance.listen = (event:String, callback = null) => {
            if (callback == null) {
                return {view: (viewName, callback) => this._dispatcher.listen(`${viewName}:${event}`, callback)}
            }
            return this._dispatcher.listen(`${event}`, callback);
        };
    }
}
