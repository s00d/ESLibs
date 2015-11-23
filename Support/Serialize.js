export default class Serialize {
    /**
     * @param value
     * @returns {String}
     */
    static toString(value) {
        var result = this.toStructure(value);
        return result ? result.toString() : '';
    }

    /**
     * @param value
     * @returns {String}
     */
    static toJson(value) {
        return JSON.stringify(
            this.toStructure(value)
        );
    }

    /**
     * @param value
     * @returns {*}
     */
    static toStructure(value) {
        var result = value;

        if (typeof value !== 'object' || value instanceof Array) {
            result = value;

        } else if (typeof value.toObject === 'function') {
            result = value.toObject();

        } else if (typeof value.toArray === 'function') {
            result = value.toArray();

        } else if (value != null) {
            result = value.toString();

        } else {
            result = value;
        }

        if (typeof result === 'function') {
            return result();
        }

        return result;
    }
}
