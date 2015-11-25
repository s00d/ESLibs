import Arr from "/Support/Arr";
import Dispatcher from "/Events/Dispatcher";

/**
 * Template parser
 */
export default class Parser {
    static EVENT_FIND_TEXT      = 'text';
    static EVENT_FIND_ATTRIBUTE = 'attribute';
    static EVENT_FIND_IGNORED   = 'ignored';

    /**
     * @type {Dispatcher}
     */
    events = new Dispatcher;

    /**
     * @type {Array}
     */
    ignoreNodes = [];

    /**
     * @param {Node|string} template
     */
    parse(template) {
        if (typeof template === 'string') {
            var buffer = document.createElement('div');
            buffer.innerHTML = template;
            template = buffer.childNodes[0];
        }

        for (var node of template.childNodes) {
            this.parseNode(node);
        }
    }

    /**
     * @param nodeNames
     * @returns {Parser}
     */
    ignore(...nodeNames) {
        this.ignoreNodes = this.ignoreNodes.concat(
            nodeNames.map(name => name.toLowerCase())
        );
        return this;
    }

    /**
     * @param callback
     * @returns {EventObject}
     */
    onIgnore(callback) {
        return this.events.listen(Parser.EVENT_FIND_IGNORED, callback);
    }

    /**
     * @param callback
     * @returns {EventObject}
     */
    onAttribute(callback) {
        return this.events.listen(Parser.EVENT_FIND_ATTRIBUTE, callback);
    }

    /**
     * @param callback
     * @returns {EventObject}
     */
    onText(callback) {
        return this.events.listen(Parser.EVENT_FIND_TEXT, callback);
    }

    /**
     * @param node
     */
    parseNode(node) {
        var name = node.nodeName.toLowerCase();
        if (Arr.has(this.ignoreNodes, name)) {
            return this.events.fire(Parser.EVENT_FIND_IGNORED, node);
        }

        if (name === '#text') {
            this.events.fire(Parser.EVENT_FIND_TEXT, node, node.textContent);

        } else {
            for (var i = 0; i < (node.attributes || []).length; i++) {
                this.events.fire(Parser.EVENT_FIND_ATTRIBUTE, node, node.attributes[i].name, node.attributes[i].value);
            }
        }

        for (var child of node.childNodes) {
            this.parseNode(child);
        }
    }
}
