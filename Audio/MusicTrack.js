import Pool from "/Audio/Pool";
import Sound from "/Audio/MusicTrackTrack";
import Dispatcher from "/Events/Dispatcher";

const STATE_STOP  = Symbol('stopping');
const STATE_PLAY  = Symbol('playing');
const STATE_PAUSE = Symbol('paused');
const STATE_END   = Symbol('ended');

/**
 *
 */
export default class MusicTrackTrack extends SoundTrack {
    /**
     * @type {Array}
     * @private
     */
    static _tracks = [];

    /**
     * @param {string} path
     */
    constructor(path) {
        super(path, true);
        this.constructor._tracks.push(this);
    }

    /**
     * @returns {MusicTrack}
     */
    play() {
        for (var i = 0, len = this.constructor._tracks.length; i < len; i++) {
            this.constructor._tracks[i].stop();
        }
        return super.play();
    }
}
