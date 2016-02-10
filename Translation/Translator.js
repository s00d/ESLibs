import Str from "/Support/Str";
import Arr from "/Support/Arr";
import Obj from "/Support/Obj";
import Regex from "/Support/Regex";

/**
 *
 */
export default class Translator {
    /**
     * @type {{}}
     * @private
     */
    _texts = {};

    /**
     * @param {object} data
     * @param {string} prefix
     * @returns {Translator}
     */
    register(data = {}, prefix = '') {
        this._texts = Obj.merge(this._texts, Obj.reduce(data, prefix));
        return this;
    }

    /**
     * @param {string} text
     * @param {object} args
     * @returns {string}
     */
    translate(text:String, args:Object = {}) : String {
        var result = text || '';

        var createKeyRegExpression = key => new RegExp(`(\\s|^)(:${key})\.?(\\s|$)`, 'g');

        Object.keys(args).forEach((key) => {
            var regexp = createKeyRegExpression(Regex.escape(key));
            result = result.replace(regexp, `$1${args[key]}$3`);
        });

        Object.keys(this._texts).forEach((key) => {
            var regexp = createKeyRegExpression(Regex.escape(key));
            result = result.replace(regexp, `$1${this._texts[key]}$3`);
        });

        if (result !== text) {
            return this.translate(result, args);
        }

        return result;
    }

    /**
     * @param {string} text
     * @param {number} count
     * @returns {string}
     */
    plural(text:String, count:Number) : String {
        text = this.translate(text);
        var texts = text.split('|').concat([':count', ':count']).splice(0, 3);

        return this.translate(Str.pluralize(texts, count), {count: count});
    }
}
