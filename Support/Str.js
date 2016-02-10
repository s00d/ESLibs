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
}
