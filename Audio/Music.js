import Pool from "/Audio/Pool";
import Sound from "/Audio/Sound";
import Dispatcher from "/Events/Dispatcher";


/**
 *
 */
export default class Music extends Sound {
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
     * @returns {Music}
     */
    play():this {
        for (var i = 0, len = this.constructor._tracks.length; i < len; i++) {
            this.constructor._tracks[i].stop();
        }
        return super.play();
    }
}
