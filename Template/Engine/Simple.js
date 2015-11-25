import Regex from "/Support/Regex";
import Parser from "/Template/Parser";
import Dispatcher from "/Events/Dispatcher";

/**
 *
 */
export default class Simple {
    /**
     * @type {Dispatcher}
     */
    events = new Dispatcher;

    /**
     * @type {Parser}
     */
    parser = new Parser;

    /**
     * @type {{}}
     */
    args = {};

    /**
     * Regular expressions for arguments
     * @type {{}}
     */
    argExpressions = {};

    /**
     * @type {Map<[]>}
     */
    nodesWithArguments = new Map();

    /**
     * @type {WeakMap}
     */
    nodesOriginalData = new WeakMap();

    /**
     * @param template
     * @param args
     */
    constructor(template, args = {}) {
        this.args = args;

        Object.observe(args, fields => {
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                this.events.fire(field.type, field.name, field.oldValue, field.object[field.name]);
            }
        });

        for (var key in args) {
            this.argExpressions[key]
                = new RegExp(`\\$\\{${Regex.escape(key)}\\}`, 'g');
        }

        this.parser.onText((node, text) => {
            if (!text.trim()) { return; }

            for (let key in args) {
                if (text.match(this.argExpressions[key])) {
                    this.addNodeArgument(node, key);

                    this.events.listen('update', (field, before, after) => {
                        if (field === key) {
                            this.syncNode(node);
                        }
                    });

                    if (!this.nodesOriginalData.has(node)) {
                        this.nodesOriginalData.set(node, text);
                    }
                }
            }
        });

        this.parser.parse(template);

        this.syncTemplate();
    }

    /**
     * @param node
     * @returns {V}
     */
    getNodeArguments(node) {
        if (!this.nodesWithArguments.has(node)) {
            this.nodesWithArguments.set(node, []);
        }
        return this.nodesWithArguments.get(node);
    }

    /**
     * @param node
     * @param value
     * @returns {Simple}
     */
    addNodeArgument(node, value) {
        var args = this.getNodeArguments(node);
        args.push(value);
        this.nodesWithArguments.set(node, args);

        return this;
    }

    /**
     *
     */
    syncTemplate() {
        for (var data of this.nodesWithArguments) {
            this.syncNode(data[0]);
        }
    }

    /**
     * @param node
     */
    syncNode(node) {
        var args = this.nodesWithArguments.get(node);
        var text = this.nodesOriginalData.get(node);
        for (var i = 0; i < args.length; i++) {
            text = text.replace(
                this.argExpressions[args[i]],
                this.args[args[i]]
            );
        }

        node.textContent = text;
    }
}
