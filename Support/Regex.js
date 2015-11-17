export default class Regex {
    static escape(text) {
        return text.replace(/[\-\[\]\/\{\}\(\)\+\?\*\.\\\^\$\|]/g, "\\$&");
    }
}
