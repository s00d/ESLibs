import LockableTimer from "/DateTime/Timer/LockableTimer";
import PeriodicTimer from "/DateTime/Timer/PeriodicTimer";
import AbstractTimer from "/DateTime/Timer/AbstractTimer";
import DateInterval, {TIME_MILLISECOND} from "/DateTime/DateInterval";

/**
 * Timer loop
 */
export default class Loop {
    /**
     * @type {boolean}
     * @private
     */
    _stop = false;

    /**
     * @type {DateInterval}
     * @private
     */
    _defaultInterval = DateInterval.milliseconds(TIME_MILLISECOND * 10);

    /**
     * @type {DateInterval}
     * @private
     */
    _lastTick = DateInterval.milliseconds(Date.now());

    /**
     * @type {null}
     * @private
     */
    _timeout = null;

    /**
     * @type {Array|AbstractTimer[]|LockableTimer[]|PeriodicTimer[]}
     * @private
     */
    _events = [];

    /**
     * @param {Function} callback
     * @returns {AbstractTimer|PeriodicTimer}
     */
    subscribe(callback:Function) : PeriodicTimer {
        var event = new PeriodicTimer(callback);
        this.attach(event);
        return event;
    }

    /**
     * @param {Function} callback
     * @returns {LockableTimer|AbstractTimer|PeriodicTimer}
     */
    once(callback:Function) : PeriodicTimer {
        var event = new LockableTimer(callback);
        this.attach(event);
        return event;
    }

    /**
     * @param {AbstractTimer|LockableTimer|PeriodicTimer} timer
     * @returns {Loop}
     */
    attach(timer:AbstractTimer) : Loop {
        this._events.push(timer);
        return this;
    }

    /**
     * @returns {Loop}
     */
    start() : Loop {
        this._stop = false;
        this._lastTick.set(Date.now());
        this._loop();

        return this;
    }

    /**
     * @returns {Loop}
     */
    stop() : Loop {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
        }
        this._stop = true;
        return this;
    }

    /**
     * @returns {number|DateInterval}
     */
    get interval() : DateInterval {
        return this._defaultInterval;
    }

    /**
     * @param {number|DateInterval} value
     */
    set interval(value:DateInterval) {
        this._defaultInterval.set(value);
    }

    /**
     * @returns {Loop}
     * @private
     */
    _loop() : Loop {
        // Timeout infelicity
        var infelicity = this._lastTick
            .subMilliseconds(Date.now() - this.interval.milliseconds)
            .milliseconds;

        // Update last tick time
        this._lastTick.set(Date.now());

        // Update timeout delay
        var delay = infelicity + this.interval.milliseconds;

        this._timeout = setTimeout(() => {
            if (!this._stop) {

                var savedEvents = [];
                for (var i = 0, length = this._events.length; i < length; i++) {
                    var event = this._events[i].tick();
                    if (!event.wantsDispose()) {
                        savedEvents.push(event);
                    }
                }
                this._events = savedEvents;

                this._loop();
            }
        }, delay > 0 ? delay : 1);

        return this;
    }
}

