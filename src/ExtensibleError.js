import _ from 'lodash';

export default class ExtensibleError extends Error {
    constructor(statusCode, errorCode, message, data) {
        super(message);

        this._statusCode = _.get(data, '_statusCode', statusCode);
        this._errorCode = _.get(data, '_errorCode', errorCode);
        this._status = 'ERROR';
        this.message = message;

        if (data && _.isObject(data)) {
            _(data).keys().forEach((key) => {
                this[key] = data[key];
            });
        } else {
            this.data = data;
        }

        Error.captureStackTrace(this, this.constructor.name);
    }
}