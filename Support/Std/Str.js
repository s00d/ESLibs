/**
 * String helpers
 */
export default class Str {
    /**
     * @param {string} string
     * @param {number} length
     * @returns {string}
     */
    static upperCaseFirst(string:string, length:number = 1):string {
        string = string.toString();

        var f = string.charAt(length - 1).toUpperCase();
        return f + string.substr(length, string.length - length);
    }

    /**
     * @param {string} string
     * @param {number} length
     * @returns {string}
     */
    static lowerCaseFirst(string:string, length:number = 1):string {
        string = string.toString();

        var f = string.charAt(length - 1).toLowerCase();
        return f + string.substr(length, string.length - length);
    }

    /**
     * @param {string} string
     * @returns {string}
     */
    static studlyCase(string:string):string {
        return string
            .split(/\W/g)
            .map(char => Str.upperCaseFirst(char))
            .join('');
    }

    /**
     * @param {string} string
     * @returns {boolean}
     */
    static isLower(string:string):boolean {
        return string === string.toLowerCase();
    }

    /**
     * @param {string} string
     * @returns {boolean}
     */
    static isUpper(string:string):boolean {
        return string === string.toUpperCase();
    }

    /**
     * @param {string} string
     * @returns {string}
     */
    static camelCase(string:string):string {
        return this.lowerCaseFirst(this.studlyCase(string));
    }

    /**
     * @param {string} string
     * @param {string|string[]|Array} needles
     */
    static startsWith(string:string, needles:string|Array):boolean {
        needles = typeof needles === 'string' ? [needles] : needles;

        for (var needle of needles) {
            if (string[0] === needle) {
                return true;
            }
        }

        return false;
    }


    /**
     * @param {string} string
     * @param {string|string[]|Array} needles
     */
    static endsWith(string:string, needles:string|Array):boolean {
        needles = typeof needles === 'string' ? [needles] : needles;

        for (var needle of needles) {
            if (string[string.length - 1] === needle) {
                return true;
            }
        }

        return false;
    }


    /**
     * @param {string} string
     * @param {string} delimiter
     * @returns {string}
     */
    static snakeCase(string:string, delimiter = '_'):string {
        if (this.isLower(string)) {
            return string;
        }

        return string.replace(/\s+/g, '').replace(/(.)(?=[A-Z])/g, `$1${delimiter}`)
    }

    /**
     * @param {Array} texts
     * @param {number} n
     * @returns {*}
     */
    static pluralize(texts:Array, n:number):string {
        return texts[
            n % 10 === 1 && n % 100 !== 11
                ? 0
                : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)
                ? 1
                : 2
            ];
    }

    /**
     * @param {string} value
     * @param {number} count
     * @returns {string}
     */
    static repeat(value:string = '-', count:number = 1):string {
        var result = '';
        for (var i = 0; i < count; i++) {
            result += value.toString();
        }
        return result;
    }

    /**
     * @param {string} value
     * @param {number} decimals
     * @returns {Array.<T>|T[]}
     */
    static zeroFirst(value:string, decimals:number = 2):string {
        value = value.toString();
        if (value.length >= decimals) {
            return value;
        }

        return this.repeat('0', decimals - value.length) + value;
    }

    /**
     * @returns {string}
     */
    static guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
