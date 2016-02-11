/**
 * String helpers
 */
export default class Str {
    /**
     * @param string
     * @param length
     * @returns {string}
     */
    static upperCaseFirst(string, length = 1) {
        string = string.toString();

        var f = string.charAt(length - 1).toUpperCase();
        return f + string.substr(length, string.length - length);
    }

    /**
     * @param {Array} texts
     * @param n
     * @returns {*}
     */
    static pluralize(texts:Array, n) {
        return texts[
            n % 10 === 1 && n % 100 !== 11
                ? 0
                : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
                    ? 1
                    : 2
        ];
    }

    /**
     * @param value
     * @param count
     * @returns {string}
     */
    static repeat(value = '-', count = 1) {
        var result = '';
        for (var i = 0; i < count; i++) {
            result += value.toString();
        }
        return result;
    }

    /**
     * @param value
     * @param decimals
     * @returns {Array.<T>|T[]}
     */
    static zeroFirst(value, decimals = 2) {
        value = value.toString();
        if (value.length >= decimals) {
            return value;
        }

        return this.repeat('0', decimals - value.length) + value;
    }
}
