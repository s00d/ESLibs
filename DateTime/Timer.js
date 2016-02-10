import TimerEvent from "/DateTime/Timer/TimerEvent";
import DateInterval, {TIME_MILLISECOND} from "/DateTime/DateInterval";

export default class Timer {
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
     * @type {Array|TimerEvent}
     * @private
     */
    _events = [];

    /**
     * @param {Function} callback
     * @returns {TimerEvent}
     */
    subscribe(callback:Function) {
        var event = new TimerEvent(callback);
        this.attach(event);
        return event;
    }

    /**
     * @param {TimerEvent} timerEvent
     * @returns {Timer}
     */
    attach(timerEvent:TimerEvent) {
        this._events.push(timerEvent);
        return this;
    }

    /**
     * @returns {Timer}
     */
    start() {
        this._stop = false;
        this._lastTick.set(Date.now());
        this._loop();
        return this;
    }

    /**
     * @returns {Timer}
     */
    stop() {
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
    get interval() {
        return this._defaultInterval;
    }

    /**
     * @param {number|DateInterval} value
     */
    set interval(value) {
        this._defaultInterval.set(value);
    }

    /**
     * @returns {Timer}
     * @private
     */
    _loop() {
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

