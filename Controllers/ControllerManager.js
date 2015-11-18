import Inject from "/Container/Inject";
import Facade from "/Container/Facade";

/**
 * Controller manager
 */
export default class ControllerManager {
    /**
     * @type {string}
     */
    nodes = 'data-controller';

    /**
     * @type {Map}
     */
    controllers = new Map;

    /**
     * @param {string} nodes
     */
    constructor(nodes = null) {
        this.nodes = nodes || this.nodes;
    }

    /**
     * @param controller
     * @returns {Set|BaseController|null}
     */
    @Inject('app')
    get(controller, app:Facade) {
        var controllers = this.getControllerContainer(controller);

        if (controllers.size === 0) {
            return null;
        } else if (controllers.size === 1) {
            return controllers.values().next().value;
        }

        return controllers;
    }

    /**
     * @param controller
     */
    dispose(controller) {
        var controllers = this.getControllerContainer(controller);
        for (var controller of controllers) {
            controller.destructor();
        }
        this.controllers.delete(controller);
        return this;
    }

    /**
     * Find controllers and init them
     */
    @Inject('app')
    findAndApply(app:Facade) {
        [].slice.call(document.body.querySelectorAll(`[${this.nodes}]`), 0).forEach(node => {
            var name = node.getAttribute(this.nodes);
            this.apply(name, node);
        });
    }

    /**
     * @param name
     * @returns {Set}
     */
    getControllerContainer(name:String) {
        if (!this.controllers.has(name)) {
            this.controllers.set(name, new Set);
        }
        return this.controllers.get(name);
    }

    /**
     * @param controller
     * @param node
     * @returns {*}
     */
    @Inject('app')
    apply(controller:Function, node:HTMLElement, app:Facade) {
        var instance = app.resolve(require('Controllers/' + controller), node);

        this.getControllerContainer(controller).add(instance);

        ko.applyBindings(instance, node);

        return instance;
    }
}
