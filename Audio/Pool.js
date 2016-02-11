/**
 *
 */
export default class Pool {
    /**
     * @type {WeakMap<string, Audio>|WeakMap}
     * @private
     */
    static _storage = new WeakMap;

    /**
     * @param path
     * @returns {V}
     */
    static get(path) {
        if (this._storage.has(path)) {
            this._storage.set(path, new Audio(path));
        }

        var audio = this._storage.get(path);
        audio.volume = true;
        audio.currentTime = 0;

        return audio;
    }
}
