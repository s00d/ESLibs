import Pool from "/Audio/Pool";
import Dispatcher from "/Events/Dispatcher";

const STATE_STOP  = Symbol('stopping');
const STATE_PLAY  = Symbol('playing');
const STATE_PAUSE = Symbol('paused');
const STATE_END   = Symbol('ended');

/**
 *
 */
export default class Sound {
    /**
     * @type {number}
     * @private
     */
    static _masterVolume = 1;

    /**
     * @param value
     * @returns {Sound}
     */
    static setMasterVolume(value = 1):Sound {
        this._masterVolume = value;
        return this;
    }

    /**
     * @returns {number}
     */
    static getMasterVolume():number {
        return this._masterVolume;
    }

    /**
     * @type {Audio}
     * @private
     */
    _audio = null;

    /**
     * @type {number}
     * @private
     */
    _volume = 1;

    /**
     * @type {Dispatcher}
     * @private
     */
    _events = new Dispatcher;

    /**
     * @type {number}
     * @private
     */
    _state = STATE_STOP;

    /**
     * @param {string} path
     * @param {bool} pooled
     */
    constructor(path, pooled = false) {
        this._audio = pooled ? Pool.get(path) : new Audio(path);

        this._audio.addEventListener('ended', (e) => {
            this._state = STATE_END;
            this._events.fire('play:end', this);
        }, false);

        this._audio.addEventListener('progress', (e) => {
            this._events.fire('play:progress', e);
        }, false);

        this.volume = 1;
    }

    /**
     * @param {string} event
     * @param {Function} callback
     * @returns {EventObject}
     */
    on(event:string, callback:Function) {
        return this._events.listen(event, callback);
    }

    /**
     * @returns {number}
     */
    get masterVolume():number {
        return this.constructor._masterVolume;
    }

    /**
     * @param {number} value
     */
    static set masterVolume(value:number) {
        this._masterVolume = value;
    }

    /**
     * @returns {number}
     */
    get volume():number {
        return this._volume;
    }

    /**
     * @param {number} value
     */
    set volume(value:number) {
        this._volume       = value;
        this._audio.volume = (this._volume + this.constructor._masterVolume) / 2;
    }

    /**
     * @returns {Sound}
     */
    play() {
        this._audio.play();

        var isPause = this._state === STATE_PAUSE;
        this._state = STATE_PLAY;

        if (isPause) {
            this._events.fire('play:continue', this);
        } else {
            this._events.fire('play:start', this);
        }

        return this;
    }

    /**
     * @returns {Sound}
     */
    pause() {
        this._audio.pause();

        this._state = STATE_PAUSE;
        this._events.fire('play:pause', this);
        return this;
    }

    /**
     * @returns {Sound}
     */
    stop() {
        this._audio.pause();
        this._audio.currentTime = 0;

        this._state = STATE_STOP;
        this._events.fire('play:stop', this);
        return this;
    }
}
