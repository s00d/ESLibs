import Regex from "/Support/Std/Regex";
import Str from "/Support/Std/Str";
import Arr from "/Support/Std/Arr";
import Obj from "/Support/Std/Obj";
import Dictionary from "/Translation/Dictionary";

/**
 * Symfony and Laravel format compatible translator
 * @see https://laravel.com/docs/5.2/localization
 * @see http://symfony.com/doc/current/book/translation.html
 */
export default class Translator {
    /**
     * @type {{}}
     * @private
     */
    _texts = {};

    /**
     * @type {{}}
     * @private
     */
    _dictionaries = {};

    /**
     * @type {string}
     * @private
     */
    _locale = 'en';

    /**
     * @param locale
     */
    constructor(locale = 'en') {
        this.locale = locale;
    }

    /**
     * @param {String} name
     */
    set locale(name:String) {
        this._locale = name;
        if (!this._dictionaries[name]) {
            this._dictionaries[name] = new Dictionary;
        }
    }

    /**
     * @returns {String}
     */
    get locale() : String {
        return this._locale;
    }

    /**
     * @returns {*}
     */
    get dictionary() {
        return this._dictionaries[this._locale];
    }

    /**
     * @param {object} data
     * @param {string} prefix
     * @returns {Translator}
     */
    register(data = {}, prefix = '') {
        this.dictionary.addMany(data, prefix);
        return this;
    }

    /**
     * @param key
     * @returns {string|Object|array}
     */
    get(key) {
        return this.dictionary.get(key);
    }

    /**
     * @param key
     * @param escape
     * @returns {RegExp}
     */
    keyRegexp(key, escape = true) {
        if (escape) { key = Regex.escape(key); }
        return new RegExp(`(:${key})\.?(\\s|$)`, 'g');
    }

    /**
     * @param {string} text
     * @param {object} args
     * @returns {string}
     */
    translate(text:String, args:Object = {}):String {
        var result = this.replace(text || '', this.createDictionary(text, args));

        if (Object.keys(this.createDictionary(result, args)).length > 0) {
            return this.translate(result, args);
        }

        return result;
    }

    /**
     * @param text
     * @param args
     * @returns {{}}
     */
    createDictionary(text, args = {}) {
        var result   = {};
        var patterns = (text.match(this.keyRegexp('[a-z0-9\\.]+', false)) || []);
        args         = this.dictionary.withAttributes(args);

        for (var i = 0; i < patterns.length; i++) {
            var key = patterns[i].trim().substr(1);
            if (args[key] != null) {
                result[key] = args[key].toString();
            }
        }

        return result;

    }

    /**
     * @param text
     * @param args
     * @returns {*}
     */
    replace(text, args = {}) {
        var result = text;

        Object.keys(args).forEach(key => {
            var regexp = this.keyRegexp(key);
            var value  = (args[key] == null) ? '' : args[key].toString();
            result = result.replace(regexp, `${value}$2`);
        });

        return result;
    };

    /**
     * @param {string} text
     * @param {number|object} args
     * @returns {string}
     */
    choice(text:String, args = {}):String {
        if (typeof args === 'string' || typeof args === 'number') {
            args = {count: parseInt(args || 0)};
        }
        var count = args.count || 0;

        var texts = this
            .translate(text, args)
            .split('|');

        var matches = [];
        for (var i = 0, length = texts.length; i < length; i++) {
            matches = (/^(?:{|\[)([0-9]+)(?:}|\])\s(.*?)$/g).exec(texts[i]);
            if (matches && count === parseInt(matches[1])) {
                return matches[2];
            }

            matches = (/^(\[|\])([0-9]+|\-Inf)\s*,\s*([0-9]+|Inf)(\[|\])\s(.*?)$/g).exec(texts[i]);
            if (matches && matches.length === 6) {
                var first       = matches[2] === '-Inf' ? Number.MIN_VALUE : parseInt(matches[2]);
                var second      = matches[3] === 'Inf'  ? Number.MAX_VALUE : parseInt(matches[3]);
                var firstEqual  = (matches[1] === '[') ? count >= first  : count > first;
                var secondEqual = (matches[4] === ']') ? count <= second : count < second;

                if (firstEqual && secondEqual) {
                    return matches[5];
                }
            }
        }

        if (texts < 3) {
            texts = texts
                .concat([':count', ':count'])
                .splice(0, 3);
        }

        return this.replace(Str.pluralize(texts, count), args);
    }
}
