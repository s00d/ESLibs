/**
 * Hash functions
 */
export default class Hash {
    /**
     * @type {objectHash}
     */
    instance = objectHash;

    /**
     * @param object
     * @param options
     * @returns {string}
     */
    make(object, options) {
        return this.instance(object, options);
    }

    /**
     * @param object
     * @returns {string}
     */
    sha1(object) {
        return this.instance.sha1(object);
    }

    /**
     * @param object
     * @returns {string}
     */
    md5(object) {
        return this.instance.md5(object);
    }
}
