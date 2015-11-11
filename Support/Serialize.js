export default class Serialize {
    /**
     * @param object
     * @returns {String}
     */
    static objectToString(object) {
        return JSON.stringify(object);
    }
}
