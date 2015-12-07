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
        Object.defineProperty(controller.prototype, 'app', { get: () => app });

        return this;
    }


    /**
     * @returns {*|void}
     */
    @Inject('app')
    search(app, attribute, callback) {
        [].slice.call(document.querySelectorAll(`[${attribute}]`), 0).forEach(node => {
            var name = node.getAttribute(attribute);
            var controller = this._controllers[name];
            var instance   = app.resolve(controller, app);

            this.injectInstanceFields(instance, name);

            callback(instance, node);
        });
    }



    /**
     * @param instance
     * @param alias
     */
    injectInstanceFields(instance, alias) {
        Object.defineProperty(instance, 'fire', {
            get: (event, ...args) => this._dispatcher.fire(`${alias}:${event}`, ...args)
        });

        Object.defineProperty(instance, 'listen', {
            get: (event:String, callback = null) => {
                if (callback == null) {
                    return {view: (viewName, callback) => this._dispatcher.listen(`${viewName}:${event}`, callback)}
                }
                return this._dispatcher.listen(`${event}`, callback);
            }
        });
    }
}
