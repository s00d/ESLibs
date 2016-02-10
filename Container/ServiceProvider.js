import Inject from "/Container/Inject";
import Abstract from "/Support/Abstract";
import Container from "/Container/Container";

/**
 * Abstract service provider
 */
@Inject('app')
export default class ServiceProvider {
    /**
     * @type {null|Container}
     */
    _app = null;

    /**
     * @param app
     */
    constructor(app:Container) {
        this._app = app;
    }

    /**
     * @returns {Container}
     */
    get app() {
        return this._app;
    }

    /**
     * Register method
     */
    register() {}

    /**
     * Boot event
     */
    @Abstract boot() {}
}
