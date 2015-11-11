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
}
