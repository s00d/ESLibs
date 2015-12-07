import {VIEW} from "/View/View";
import Inject from "/Container/Inject";
import Dispatcher from "/Events/Dispatcher";
import BaseViewModel from "/View/BaseViewModel";

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
     * @type {{}}
     * @private
     */
    _instances = {};

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
     * @param view
     * @returns {BaseViewModel|null}
     */
    get(view) {
        return this._instances[view] || null;
    }

    /**
     * @param view
     * @returns {BaseViewModel|null}
     */
    getClass(view) {
        return this._controllers[view] || null;
    }

    /**
     * @param view
     * @returns {Container}
     */
    show(view) {
        this.get(view).show();
        return this;
    }

    /**
     * @param view
     * @returns {Container}
     */
    hide(view) {
        this.get(view).hide();
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
            this._instances[name] = instance;


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
