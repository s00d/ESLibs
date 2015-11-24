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

        } else if (value != null && typeof value.toObject === 'function') {
            result = value.toObject();

        } else if (value != null && typeof value.toArray === 'function') {
            result = value.toArray();

        } else if (value != null) {
            if (value instanceof Object) {
                result = {};
                for (var key in value) {
                    result[key] = this.toStructure(value[key]);
                }
            } else {
                result = value.toString();
            }
        } else {
            result = value;
        }

        if (typeof result === 'function') {
            return result();
        }

        return result;
    }
}
