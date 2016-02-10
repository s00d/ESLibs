import Arr from "/Support/Arr";
import Abstract from "/Support/Abstract";
import Collection from "/Support/Collection";

/**
 * Asset
 */
class Asset {
    /**
     * @type {null}
     */
    _value = null;

    /**
     * @type {null}
     * @private
     */
    _valueLoaded = null;

    /**
     * @type {Array}
     * @private
     */
    _aliases = [];

    /**
     * @type {boolean}
     * @private
     */
    _loaded = false;

    /**
     * @param value
     */
    constructor(value) {
        this._value = value;
    }

    /**
     * @return {Object}
     */
    @Abstract load() {}

    /**
     * @param value
     * @returns {Asset}
     * @private
     */
    _loadEnd(value) {
        this._valueLoaded = value;
        this._loaded = true;
        return this;
    }

    /**
     * @param aliases
     */
    as(...aliases) {
        this._aliases = this._aliases.concat(aliases);
    }

    /**
     * @returns {Promise}
     */
    getValue() {
        return this._valueLoaded;
    }

    /**
     * @returns {String}
     */
    get source() {
        return this._value;
    }

    /**
     * @param alias
     * @returns {boolean}
     */
    is(alias) {
        return Arr.has(this._aliases, alias);
    }
}

/**
 * ImageAsset
 */
class ImageAsset extends Asset {
    load() {
        return new Promise((resolve, reject) => {
            let image = new Image;
            image.onload = (() => {
                resolve(image);
                this._loadEnd(image);
            });
            image.onerror = ((e) => reject(e));
            image.src = this.source;
        });
    }
}

/**
 * MusicAsset
 */
class MusicAsset extends Asset {
    load() {
        return new Promise((resolve, reject) => {
            let audio       = new Audio;
            audio.preload = 'auto';
            audio.loop    = true;

            audio.addEventListener('loadedmetadata', e => {
                resolve(audio);
                this._loadEnd(audio);
            }, false);


            audio.addEventListener('error', (e) => reject(e), false);

            audio.src = this.source;
        });
    }
}

/**
 * Loader
 */
export default class Loader {
    /**
     * @type {Array|Asset[]}
     * @private
     */
    _list = [];

    /**
     * @type {Collection}
     * @private
     */
    _loaded = new Collection();

    /**
     * @param path
     * @returns {ImageAsset}
     */
    image(path) {
        var image = new ImageAsset(path);
        this._list.push(image);
        return image;
    }

    /**
     * @param path
     * @returns {MusicAsset}
     */
    music(path) {
        var audio = new MusicAsset(path);
        this._list.push(audio);
        return audio;
    }

    /**
     * @param {Function} process
     * @returns {Promise}
     */
    load(process = (asset, percentage) => {}) {
        return new Promise((resolve, reject) => {
            var length = this._list.length;
            var step   = 0;

            for (let i = 0; i < length; i++) {
                this._list[i].load()
                    .then(data => {
                        var asset = this._list[i];
                        this._loaded.push(asset);
                        process(asset, Math.round(100 / length * ++step));

                        if (step === length) {
                            resolve(this);
                            this._list = [];
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            }
        });
    }

    /**
     * @param alias
     * @returns {Collection}
     */
    get(alias) {
        return this._loaded
            .find((asset:Asset) => asset.is(alias))
            .map((asset:Asset) => asset.getValue());
    }

    /**
     * @param alias
     * @returns {Asset}
     */
    find(alias) {
        return this.get(alias).first();
    }
}
