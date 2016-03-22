import _ from 'lodash';

export default class ExtensibleError extends Error {
    constructor(message, data) {
        super(message);

        this._error = true;
        this.name = this.constructor.name;
        this.message = message;

        if (data && _.isObject(data)) {
            _(data).keys().forEach(key => {
                this[key] = data[key];
            });
        } else {
            this.data = data;
        }

        Error.captureStackTrace(this, this.constructor.name);
    }
}