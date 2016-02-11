import Private from "/DateTime/Timer/Private";
import PeriodicTimer from "/DateTime/Timer/PeriodicTimer";

export default class LockableTimer extends PeriodicTimer {
    /**
     * @param {Function} callback
     */
    constructor(callback:Function) {
        super(callback);
    }

    /**
     * @returns {PeriodicTimer}
     */
    @Private withoutOverlapping() : PeriodicTimer {}

    /**
     * @returns {PeriodicTimer}
     */
    @Private withOverlapping() : PeriodicTimer {}

    /**
     * @returns {PeriodicTimer}
     */
    tick() {
        super.withoutOverlapping();
        return super.tick();
    }

    /**
     * @param args
     * @returns {PeriodicTimer}
     */
    fire(...args) {
        super.fire(...args);
        return this.resetTimeout();
    }
}
