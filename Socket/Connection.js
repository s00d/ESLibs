import Dispatcher from "/Events/Dispatcher";

/**
 * WebSocket connection
 */
export default class Connection {
    /**
     * @type {number}
     */
    requestId = 0;

    /**
     * @type {string}
     */
    host = '';

    /**
     * @type {string}
     */
    port = '';

    /**
     * @type {null|WebSocket}
     */
    connection = null;

    /**
     * @type {Dispatcher}
     */
    events = new Dispatcher();

    /**
     * @param host
     * @param port
     */
    constructor(host = '127.0.0.1', port = '80') {
        this.host = host;
        this.port = port;
    }

    /**
     * @returns {Connection}
     */
    connect() {
        this.events.fire('opening', this);
        if (this.connection !== null) {
            this.connection.close();
        }

        this.connection           = new WebSocket(`ws://${this.host}:${this.port}`);
        this.connection.onopen    = (e) => {
            this.events.fire('open', e, this);
        };
        this.connection.onerror   = (e) => {
            this.events.fire('error', e, this);
        };
        this.connection.onmessage = (e) => {
            var data = JSON.parse(e.data);
            this.events.fire('message', data, this);
        };
        this.connection.onclose   = (e) => {
            this.events.fire('close', e, this);
        };
        return this;
    }

    /**
     * @returns {Connection}
     */
    close() {
        this.events.fire('closing', this);
        this.connection.close();
        this.connection = null;
        return this;
    }

    /**
     * @param method
     * @param params
     * @param id
     * @returns {Promise}
     */
    send(method, params = {}, id = null) {
        if (id !== null && typeof id !== 'number') {
            id = ++this.requestId;
        }

        var data = {
            id:     id,
            method: method,
            params: params
        };

        this.events.fire('sending', data, this);

        // Add header
        data['jsonrpc'] = '2.0';
        var message     = JSON.stringify(data);

        this.connection.send(message);

        this.events.fire('sent', message, this);

        return this;
    }

    /**
     * @param method
     * @param params
     * @param id
     * @returns {Promise}
     */
    async call(method, params = {}, id = null) {
        id = id || ++this.requestId;

        this.send(method, params, id);

        return new Promise((resolve, reject) => {
            // Response timeout
            var errorTimeout = setTimeout(() => {
                return reject(new Error(`Socket response timeout for requestId ${id}`, 500));
            }, 5000);

            var event = this.events.listen('message', data => {
                if (data.id === id) {
                    event.remove();
                    clearTimeout(errorTimeout);

                    if (data.result === null && data.error) {
                        var error = data.error;
                        reject(new Error(JSON.stringify(error.message), error.id));
                    } else {
                        resolve(data);
                    }
                }
            });
        });
    }

    /**
     * @param event
     * @param callback
     * @returns {Connection}
     */
    on(event:String, callback:Function) {
        this.events.listen(event, callback);
        return this;
    }

    /**
     * @param {Function} callback
     * @returns {Connection}
     */
    onOpen(callback:Function) {
        this.events.listen('open', cb);
        return this;
    }

    /**
     * @param {Function} callback
     * @returns {Connection}
     */
    onError(callback:Function) {
        this.events.listen('error', cb);
        return this;
    }

    /**
     * @param {Function} callback
     * @returns {Connection}
     */
    onMessage(callback:Function) {
        this.events.listen('message', cb);
        return this;
    }

    /**
     * @param {Function} callback
     * @returns {Connection}
     */
    onClose(callback:Function) {
        this.events.listen('close', cb);
        return this;
    }

    /**
     * @returns {*}
     */
    toString() {
        return `ws://${this.host}:${this.port}`;
    }
}
