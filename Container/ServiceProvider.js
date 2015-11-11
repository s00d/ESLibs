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
    app = null;

    /**
     * @param app
     */
    constructor(app:Container) {
        this.app = app;
    }

    /**
     * Boot event
     */
    @Abstract boot() {}
}
